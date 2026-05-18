import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAdminStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { facilityId } = session;

    // Appointments in last 6 calendar months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const since = sixMonthsAgo.toISOString().slice(0, 10);

    const [appointmentsResult, patientsResult, staffResult] = await Promise.all([
        supabase
            .from("cura_appointments")
            .select("appointment_date, status")
            .eq("facility_id", facilityId)
            .gte("appointment_date", since),
        supabase
            .from("cura_appointments")
            .select("profile_id")
            .eq("facility_id", facilityId),
        supabase
            .from("cura_staff_profiles")
            .select("id, role")
            .eq("facility_id", facilityId),
    ]);

    if (appointmentsResult.error || patientsResult.error || staffResult.error) {
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }

    // Group appointments by month (YYYY-MM)
    const byMonth: Record<string, number> = {};
    for (const appt of appointmentsResult.data ?? []) {
        const month = appt.appointment_date.slice(0, 7); // "YYYY-MM"
        byMonth[month] = (byMonth[month] ?? 0) + 1;
    }

    // Build ordered 6-month array
    const months: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        months.push({ month: key, count: byMonth[key] ?? 0 });
    }

    const uniquePatients = new Set(
        (patientsResult.data ?? []).map((r) => r.profile_id).filter(Boolean)
    ).size;

    const staffByRole = (staffResult.data ?? []).reduce<Record<string, number>>(
        (acc, s) => {
            const role = s.role ?? "unknown";
            acc[role] = (acc[role] ?? 0) + 1;
            return acc;
        },
        {}
    );

    return NextResponse.json({
        appointmentsByMonth: months,
        totalPatients: uniquePatients,
        staffByRole,
        totalAppointmentsThisMonth: months[months.length - 1]?.count ?? 0,
        totalAppointmentsLastMonth: months[months.length - 2]?.count ?? 0,
    });
}
