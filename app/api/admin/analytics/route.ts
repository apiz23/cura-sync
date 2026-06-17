import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requireAdminStaffSession } from "@/lib/authz";

export async function GET(req: Request) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { facilityId } = session;

    const url = new URL(req.url);
    const fromParam = url.searchParams.get("from");
    const toParam = url.searchParams.get("to");

    let since: string;
    let until: string;

    if (fromParam && toParam) {
        since = fromParam;
        until = toParam;
    } else {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        since = sixMonthsAgo.toISOString().slice(0, 10);
        until = new Date().toISOString().slice(0, 10);
    }

    const [appointmentsResult, allTimePatientsResult, staffResult] = await Promise.all([
        supabase
            .from("cura_appointments")
            .select("appointment_date, status, profile_id")
            .eq("facility_id", facilityId)
            .gte("appointment_date", since)
            .lte("appointment_date", until),
        supabase
            .from("cura_appointments")
            .select("profile_id")
            .eq("facility_id", facilityId),
        supabase
            .from("cura_staff_profiles")
            .select("id, role")
            .eq("facility_id", facilityId),
    ]);

    if (appointmentsResult.error || allTimePatientsResult.error || staffResult.error) {
        return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
    }

    const appts = appointmentsResult.data ?? [];

    // Group by month
    const byMonth: Record<string, number> = {};
    for (const appt of appts) {
        const month = appt.appointment_date.slice(0, 7);
        byMonth[month] = (byMonth[month] ?? 0) + 1;
    }

    // Build ordered month array covering the full range
    const months: { month: string; count: number }[] = [];
    const startDate = new Date(since);
    startDate.setDate(1);
    const endDate = new Date(until);
    endDate.setDate(1);
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
        months.push({ month: key, count: byMonth[key] ?? 0 });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    for (const appt of appts) {
        const s = appt.status ?? "UNKNOWN";
        statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
    }

    // Unique patients in range
    const uniquePatientsInRange = new Set(
        appts.map((r) => r.profile_id).filter(Boolean)
    ).size;

    // All-time unique patients (backwards compat)
    const uniquePatients = new Set(
        (allTimePatientsResult.data ?? []).map((r) => r.profile_id).filter(Boolean)
    ).size;

    const staffByRole = (staffResult.data ?? []).reduce<Record<string, number>>(
        (acc, s) => {
            const role = s.role ?? "unknown";
            acc[role] = (acc[role] ?? 0) + 1;
            return acc;
        },
        {}
    );

    // Backwards-compat month counts
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    return NextResponse.json({
        appointmentsByMonth: months,
        totalPatients: uniquePatients,
        totalPatientsInRange: uniquePatientsInRange,
        totalAppointmentsInRange: appts.length,
        statusBreakdown,
        staffByRole,
        totalAppointmentsThisMonth: byMonth[thisMonthKey] ?? 0,
        totalAppointmentsLastMonth: byMonth[lastMonthKey] ?? 0,
    });
}
