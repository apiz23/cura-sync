import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import supabase from "@/lib/supabase";
import { requireAnySession } from "@/lib/authz";
import { MEDICATION_STATUS } from "@/lib/constants";
import { logAudit, actorFromSession } from "@/lib/audit";
import { presentMedications } from "@/lib/medication-presenter";

const createMedicationSchema = z.object({
    profile_id: z.string().optional(),
    name: z.string().min(1, "name is required"),
    dosage: z.string().min(1, "dosage is required"),
    frequency: z.string().min(1, "frequency is required"),
    schedule: z.string().min(1, "schedule is required"),
    start_date: z.string().min(1, "start_date is required"),
    end_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    prescribed_by: z.string().optional().nullable(),
});

/* =========================
   GET /api/medications
   ========================= */
export async function GET(req: NextRequest) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const profileId =
        session.kind === "patient"
            ? session.profileId
            : searchParams.get("profile_id");

    if (session.kind === "staff") {
        if (!profileId) {
            return NextResponse.json(
                { error: "profile_id is required" },
                { status: 400 }
            );
        }

        const { data: reg, error: regError } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("profile_id", profileId)
            .eq("facility_id", session.facilityId)
            .eq("status", "active")
            .maybeSingle();

        if (regError) {
            return NextResponse.json(
                { error: "Access check failed" },
                { status: 500 }
            );
        }

        if (!reg) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", profileId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(await presentMedications(data ?? []));
}

/* =========================
   POST /api/medications
   ========================= */
export async function POST(req: NextRequest) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    if (
        session.kind !== "patient" &&
        !(session.kind === "staff" && (session.role === "doctor" || session.role === "admin"))
    ) {
        return NextResponse.json(
            { error: "Only doctors, admins, or patients (for self) can create medications" },
            { status: 403 }
        );
    }

    const body = await req.json();
    const parsed = createMedicationSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
            { status: 400 }
        );
    }

    const { name, dosage, frequency, schedule, start_date, end_date, notes } = parsed.data;

    let effectiveProfileId: string;
    let prescribedBy: string;

    if (session.kind === "patient") {
        // TypeScript knows session: PatientSession here — no cast needed
        effectiveProfileId = session.profileId;
        prescribedBy = "self";
    } else {
        // TypeScript knows session: StaffSession here — no cast needed
        const staffProfileId = parsed.data.profile_id;
        if (!staffProfileId) {
            return NextResponse.json({ error: "profile_id is required" }, { status: 400 });
        }

        const { data: reg, error: regError } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("profile_id", staffProfileId)
            .eq("facility_id", session.facilityId)
            .eq("status", "active")
            .maybeSingle();

        if (regError) {
            return NextResponse.json({ error: "Access check failed" }, { status: 500 });
        }
        if (!reg) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        effectiveProfileId = staffProfileId;
        prescribedBy = session.staffId;  // authenticated identity, not caller-supplied
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .insert({
            profile_id: effectiveProfileId,
            name,
            dosage,
            frequency,
            schedule,
            start_date,
            end_date,
            notes,
            prescribed_by: prescribedBy,
            status: MEDICATION_STATUS.ACTIVE,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void logAudit({
        ...actorFromSession(session),
        action: "CREATE",
        resource_type: "medication",
        resource_id: data.id,
        metadata: { name, profile_id: effectiveProfileId },
    });

    return NextResponse.json(data, { status: 201 });
}
