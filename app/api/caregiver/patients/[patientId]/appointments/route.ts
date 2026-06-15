import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireCaregiverSession } from "@/lib/authz";

async function verifyCaregiverLink(caregiverId: string, patientId: string): Promise<boolean> {
    const { data } = await supabase
        .from("cura_caregiver_links")
        .select("id")
        .eq("caregiver_profile_id", caregiverId)
        .eq("patient", patientId)
        .eq("status", "ACTIVE")
        .maybeSingle();
    return !!data;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ patientId: string }> }
) {
    const session = await requireCaregiverSession(req);
    if (session instanceof NextResponse) return session;

    const { patientId } = await params;

    const linked = await verifyCaregiverLink(session.profileId, patientId);
    if (!linked) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: appts, error } = await supabase
        .from("cura_appointments")
        .select("id, facility_id, appointment_date, start_time, end_time, status, reason_for_visit, created_at")
        .eq("profile_id", patientId)
        .order("appointment_date", { ascending: false })
        .limit(20);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const facilityIds = [...new Set((appts ?? []).map((a: any) => a.facility_id).filter(Boolean))];
    const { data: facilities } = facilityIds.length
        ? await supabase.from("cura_facilities").select("id, name").in("id", facilityIds)
        : { data: [] };

    const facilityMap = new Map((facilities ?? []).map((f: any) => [f.id, f.name]));

    const formatted = (appts ?? []).map((a: any) => ({
        ...a,
        facility_name: a.facility_id ? (facilityMap.get(a.facility_id) ?? "Unknown Clinic") : "Unknown Clinic",
    }));

    return NextResponse.json({ data: formatted });
}
