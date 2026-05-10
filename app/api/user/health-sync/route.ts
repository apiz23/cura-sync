import { NextResponse } from "next/server";
import { z } from "zod";

import supabase from "@/lib/supabase";
import { requirePatientSession } from "@/lib/authz";

const isoDateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Expected a valid ISO datetime string",
});

const healthSyncBodySchema = z.object({
    syncedAt: isoDateTimeSchema,
    rangeStart: isoDateTimeSchema,
    rangeEnd: isoDateTimeSchema,
    source: z.object({
        platform: z.string().trim().min(1),
        vendor: z.string().trim().min(1),
        attribution: z.string().trim().min(1),
    }),
    sleepSessions: z.array(
        z.object({
            startTime: isoDateTimeSchema,
            endTime: isoDateTimeSchema,
            title: z.string().nullish(),
            notes: z.string().nullish(),
            stages: z.array(
                z.object({
                    stage: z.number().int(),
                    startTime: isoDateTimeSchema,
                    endTime: isoDateTimeSchema,
                }),
            ),
        }),
    ),
    heartRateSamples: z.array(
        z.object({
            time: isoDateTimeSchema,
            beatsPerMinute: z.number().finite().nonnegative(),
        }),
    ),
    stepsSummary: z.object({
        startTime: isoDateTimeSchema,
        endTime: isoDateTimeSchema,
        count: z.number().finite().nonnegative(),
    }),
});

type HealthSyncBody = z.infer<typeof healthSyncBodySchema>;

type HealthSyncSnapshotRow = {
    id: string;
    synced_at: string;
    range_start: string;
    range_end: string;
    source_platform: string;
    source_vendor: string;
    source_attribution: string;
    sleep_sessions_count: number;
    total_sleep_minutes: number;
    average_heart_rate_bpm: number | null;
    steps_count: number;
    payload: HealthSyncBody;
    created_at?: string;
    updated_at?: string;
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
        steps_count: Math.round(body.stepsSummary.count),
    };
}

function toApiSnapshot(row: HealthSyncSnapshotRow) {
    return {
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
        },
        payload: row.payload,
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
    };
}

function parseLimit(url: string) {
    const raw = new URL(url).searchParams.get("limit");
    const value = raw ? Number(raw) : 5;

    if (!Number.isFinite(value)) {
        return 5;
    }

    return Math.min(Math.max(Math.trunc(value), 1), 20);
}

function parseDays(url: string) {
    const raw = new URL(url).searchParams.get("days");
    if (!raw) return null;

    const value = Number(raw);
    if (!Number.isFinite(value)) return null;

    // Keep this small; mobile will request 7 by default.
    return Math.min(Math.max(Math.trunc(value), 1), 30);
}

function startOfUtcDay(value: Date) {
    const d = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    return d;
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

export async function GET(req: Request) {
    try {
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const days = parseDays(req.url);
        const limit = days ?? parseLimit(req.url);
        const sinceIso =
            days !== null
                ? (() => {
                      const now = new Date();
                      const since = startOfUtcDay(now);
                      since.setUTCDate(since.getUTCDate() - (days - 1));
                      return since.toISOString();
                  })()
                : null;

        // We build the main query separately so we can conditionally add the `since` filter.
        const snapshotsQuery = supabase
            .from("cura_health_sync_snapshots")
            .select(
                `
                    id,
                    synced_at,
                    range_start,
                    range_end,
                    source_platform,
                    source_vendor,
                    source_attribution,
                    sleep_sessions_count,
                    total_sleep_minutes,
                    average_heart_rate_bpm,
                    steps_count,
                    payload,
                    created_at,
                    updated_at
                `,
            )
            .eq("profile_id", patient.profileId)
            .order(days !== null ? "range_start" : "synced_at", { ascending: false })
            .limit(limit);

        const snapshotsResult = sinceIso
            ? await snapshotsQuery.gte("range_start", sinceIso)
            : await snapshotsQuery;

        const countResult = await supabase
            .from("cura_health_sync_snapshots")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", patient.profileId);

        if (snapshotsResult.error) {
            return NextResponse.json(
                { error: snapshotsResult.error.message },
                { status: 500 },
            );
        }

        if (countResult.error) {
            return NextResponse.json(
                { error: countResult.error.message },
                { status: 500 },
            );
        }

        const items = ((snapshotsResult.data ?? []) as HealthSyncSnapshotRow[]).map(
            toApiSnapshot,
        );

        return NextResponse.json({
            success: true,
            data: {
                latest: items[0] ?? null,
                recent: items,
                count: countResult.count ?? items.length,
            },
        });
    } catch (error) {
        console.error("Health sync fetch error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const parsedBody = healthSyncBodySchema.safeParse(await req.json());

        if (!parsedBody.success) {
            return NextResponse.json(
                {
                    error: "Invalid health sync payload",
                    details: parsedBody.error.flatten(),
                },
                { status: 400 },
            );
        }

        const body = parsedBody.data;
        const summary = summarize(body);
        const row = {
            profile_id: patient.profileId,
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
        };

        const { data: existingSnapshot, error: existingSnapshotError } = await supabase
            .from("cura_health_sync_snapshots")
            .select("id")
            .eq("profile_id", patient.profileId)
            .eq("synced_at", body.syncedAt)
            .eq("range_start", body.rangeStart)
            .eq("range_end", body.rangeEnd)
            .eq("source_platform", body.source.platform)
            .eq("source_vendor", body.source.vendor)
            .maybeSingle();

        if (existingSnapshotError) {
            return NextResponse.json(
                { error: existingSnapshotError.message },
                { status: 500 },
            );
        }

        const query = existingSnapshot?.id
            ? supabase
                  .from("cura_health_sync_snapshots")
                  .update(row)
                  .eq("id", existingSnapshot.id)
            : supabase.from("cura_health_sync_snapshots").insert(row);

        const { data, error } = await query
            .select(
                `
                id,
                synced_at,
                range_start,
                range_end,
                source_platform,
                source_vendor,
                source_attribution,
                sleep_sessions_count,
                total_sleep_minutes,
                average_heart_rate_bpm,
                steps_count,
                payload,
                created_at,
                updated_at
            `,
            )
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: toApiSnapshot(data as HealthSyncSnapshotRow),
        });
    } catch (error) {
        console.error("Health sync upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
