import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireStaffSession } from "@/lib/authz";
import { logAudit } from "@/lib/audit";

async function ensurePatientInStaffFacility(
    staffFacilityId: string,
    patientId: string
): Promise<NextResponse | void> {
    const { data, error } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("facility_id", staffFacilityId)
        .eq("profile_id", patientId)
        .eq("status", "active")
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: "Access check failed" }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
}

// GET single patient
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { id } = await params;
        const facilityCheck = await ensurePatientInStaffFacility(
            session.facilityId,
            id
        );
        if (facilityCheck instanceof NextResponse) return facilityCheck;

        const { data, error } = await supabase
            .from("cura_profiles")
            .select(
                `
                id,
                email,
                full_name,
                role,
                avatar_url,
                phone_number,
                created_at,
                patient_profiles:cura_patient_profiles(*)
            `
            )
            .eq("id", id)
            .eq("role", "patient")
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Patient not found" },
                { status: 404 }
            );
        }

        // Flatten patient profile fields for UI consumers.
        const medical = (data as any)?.patient_profiles?.[0] ?? {};

        void logAudit({
            actor_id: session.staffId,
            actor_type: "staff",
            action: "READ",
            resource_type: "patient",
            resource_id: id,
        });

        return NextResponse.json({
            id: data.id,
            profile_id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            avatar_url: data.avatar_url,
            phone_number: data.phone_number,
            created_at: data.created_at,
            ...medical,
        });
    } catch (err: unknown) {
        console.error("Get patient error:", err);
        return NextResponse.json(
            { error: "Failed to fetch patient" },
            { status: 500 }
        );
    }
}

// UPDATE patient (profile + patient_profile)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { id } = await params;
        const facilityCheck = await ensurePatientInStaffFacility(
            session.facilityId,
            id
        );
        if (facilityCheck instanceof NextResponse) return facilityCheck;

        const body = await req.json();
        const { full_name, phone_number, avatar_url, patient_profile } = body;

        // Update main profile
        const { error: profileError } = await supabase
            .from("cura_profiles")
            .update({ full_name, phone_number, avatar_url })
            .eq("id", id);

        if (profileError) {
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        // Update patient profile if provided
        if (patient_profile) {
            const { error } = await supabase
                .from("cura_patient_profiles")
                .update(patient_profile)
                .eq("profile_id", id);

            if (error) {
                return NextResponse.json(
                    { error: "Failed to update patient profile" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error("Update patient error:", err);
        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}

// PATCH patient (partial update)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { id } = await params;
        const facilityCheck = await ensurePatientInStaffFacility(
            session.facilityId,
            id
        );
        if (facilityCheck instanceof NextResponse) return facilityCheck;

        const body = await req.json();

        const { data, error } = await supabase
            .from("cura_profiles")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Failed to update patient" },
                { status: 400 }
            );
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("Patch patient error:", err);
        return NextResponse.json(
            { error: "Failed to update patient" },
            { status: 500 }
        );
    }
}

// DELETE patient
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { id } = await params;
        const facilityCheck = await ensurePatientInStaffFacility(
            session.facilityId,
            id
        );
        if (facilityCheck instanceof NextResponse) return facilityCheck;

        const { error } = await supabase
            .from("cura_profiles")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { error: "Failed to delete patient" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, deleted: true });
    } catch (err: unknown) {
        console.error("Delete patient error:", err);
        return NextResponse.json(
            { error: "Failed to delete patient" },
            { status: 500 }
        );
    }
}
