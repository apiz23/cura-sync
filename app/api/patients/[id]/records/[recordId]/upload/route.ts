import { NextRequest, NextResponse } from "next/server";

import { requireStaffSession, type StaffSession } from "@/lib/authz";
import { isIpfsConfigured, uploadEncryptedFileToIPFS } from "@/lib/ipfs";
import supabase from "@/lib/supabase";
import supabaseAdmin from "@/lib/supabase-admin";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

async function ensurePatientAccess(
    session: StaffSession,
    patientId: string,
): Promise<NextResponse | void> {
    if (session.isAdmin || session.role === "doctor") return;

    const { data, error } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("facility_id", session.facilityId)
        .eq("profile_id", patientId)
        .maybeSingle();

    if (error || !data) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; recordId: string }> },
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { id: patientId, recordId } = await params;

    const accessDenied = await ensurePatientAccess(session, patientId);
    if (accessDenied) return accessDenied;

    if (!isIpfsConfigured()) {
        return NextResponse.json(
            { error: "IPFS storage is not configured on this server." },
            { status: 503 },
        );
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "file field required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: "File exceeds 20 MB limit" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadEncryptedFileToIPFS(buffer, file.name, file.type, file.name);

    const { error: updateErr } = await supabaseAdmin
        .from("cura_encounters")
        .update({
            ipfs_cid: result.cid,
            ipfs_encryption_key: result.encryptionKeyB64,
            content_hash: result.cid,
        })
        .eq("id", recordId);

    if (updateErr) {
        return NextResponse.json({ error: "Failed to save IPFS reference" }, { status: 500 });
    }

    return NextResponse.json({
        cid: result.cid,
        gatewayUrl: result.gatewayUrl,
        size: result.size,
    });
}
