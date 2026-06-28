import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";
import { requireCaregiverSession } from "@/lib/authz";

async function verifyCaregiverLink(caregiverId: string, patientId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from("cura_caregiver_links")
        .select("id")
        .eq("caregiver_profile_id", caregiverId)
        .eq("patient_profile_id", patientId)
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

    const raw = new URL(req.url).searchParams.get("days");
    const days = raw ? Math.min(Math.max(Math.trunc(Number(raw)), 1), 30) : 7;
    const limit = Math.min(days * 12, 100);

    const { data, error } = await supabaseAdmin
        .from("cura_health_sync_snapshots")
        .select(`
            id, synced_at, range_start, range_end,
            source_platform, source_vendor, source_attribution,
            sleep_sessions_count, total_sleep_minutes,
            average_heart_rate_bpm, steps_count, payload,
            created_at, updated_at
        `)
        .eq("profile_id", patientId)
        .order("range_start", { ascending: false })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data ?? []).map((row: any) => ({
        id: row.id,
        syncedAt: row.synced_at,
        rangeStart: row.range_start,
        rangeEnd: row.range_end,
        source: {
            platform: row.source_platform,
            vendor: row.source_vendor,
            attribution: row.source_attribution,
        },
        summary: {
            sleepSessionsCount: row.sleep_sessions_count,
            totalSleepMinutes: row.total_sleep_minutes,
            averageHeartRateBpm: row.average_heart_rate_bpm,
            stepsCount: row.steps_count,
            averageSpo2Percent: row.payload?.averageSpo2Percent ?? null,
        },
        payload: row.payload,
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
    }));

    return NextResponse.json({
        success: true,
        data: { latest: items[0] ?? null, recent: items, count: items.length },
    });
}
