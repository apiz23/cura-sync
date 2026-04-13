import { NextResponse } from "next/server";

import supabase from "@/lib/supabase";
import { requireMobileOrBrowserUserId } from "@/lib/mobile-auth";

type HealthSyncBody = {
    syncedAt: string;
    rangeStart: string;
    rangeEnd: string;
    source: {
        platform: string;
        vendor: string;
        attribution: string;
    };
    sleepSessions: {
        startTime: string;
        endTime: string;
        title?: string | null;
        notes?: string | null;
        stages: {
            stage: number;
            startTime: string;
            endTime: string;
        }[];
    }[];
    heartRateSamples: {
        time: string;
        beatsPerMinute: number;
    }[];
    stepsSummary: {
        startTime: string;
        endTime: string;
        count: number;
    };
};

function summarize(body: HealthSyncBody) {
    const totalSleepMinutes = body.sleepSessions.reduce((total, session) => {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        return total + Math.max(0, Math.round((end - start) / 60000));
    }, 0);

    const averageHeartRate =
        body.heartRateSamples.length > 0
            ? Math.round(
                  body.heartRateSamples.reduce(
                      (sum, sample) => sum + sample.beatsPerMinute,
                      0,
                  ) / body.heartRateSamples.length,
              )
            : null;

    return {
        sleep_sessions_count: body.sleepSessions.length,
        total_sleep_minutes: totalSleepMinutes,
        average_heart_rate_bpm: averageHeartRate,
        steps_count: body.stepsSummary.count,
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function POST(req: Request) {
    try {
        const userId = await requireMobileOrBrowserUserId(req);
        if (userId instanceof NextResponse) return userId;

        const body = (await req.json()) as HealthSyncBody;

        if (
            !body?.syncedAt ||
            !body?.rangeStart ||
            !body?.rangeEnd ||
            !body?.source?.platform ||
            !body?.source?.vendor
        ) {
            return NextResponse.json(
                { error: "Invalid health sync payload" },
                { status: 400 },
            );
        }

        const summary = summarize(body);

        const { data, error } = await supabase
            .from("cura_health_sync_snapshots")
            .insert({
                profile_id: userId,
                synced_at: body.syncedAt,
                range_start: body.rangeStart,
                range_end: body.rangeEnd,
                source_platform: body.source.platform,
                source_vendor: body.source.vendor,
                source_attribution: body.source.attribution,
                sleep_sessions_count: summary.sleep_sessions_count,
                total_sleep_minutes: summary.total_sleep_minutes,
                average_heart_rate_bpm: summary.average_heart_rate_bpm,
                steps_count: summary.steps_count,
                payload: body,
                updated_at: new Date().toISOString(),
            })
            .select("id, synced_at, source_platform, source_vendor")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Health sync upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
