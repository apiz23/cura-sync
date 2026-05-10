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

function parseDays(url: string) {
    const raw = new URL(url).searchParams.get("days");
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    return Math.min(Math.max(Math.trunc(value), 1), 30);
}

function parseLimit(url: string) {
    const raw = new URL(url).searchParams.get("limit");
    const value = raw ? Number(raw) : 5;
    if (!Number.isFinite(value)) return 5;
    return Math.min(Math.max(Math.trunc(value), 1), 20);
}

function startOfUtcDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    try {
        const { id: patientId } = await params;

        const facilityCheck = await ensurePatientInStaffFacility(
            session.facilityId,
            patientId
        );
        if (facilityCheck instanceof NextResponse) return facilityCheck;

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
                `
            )
            .eq("profile_id", patientId)
            .order(days !== null ? "range_start" : "synced_at", { ascending: false })
            .limit(limit);

        const snapshotsResult = sinceIso
            ? await snapshotsQuery.gte("range_start", sinceIso)
            : await snapshotsQuery;

        const countResult = await supabase
            .from("cura_health_sync_snapshots")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", patientId);

        if (snapshotsResult.error) {
            return NextResponse.json({ error: snapshotsResult.error.message }, { status: 500 });
        }

        if (countResult.error) {
            return NextResponse.json({ error: countResult.error.message }, { status: 500 });
        }

        const items = (snapshotsResult.data ?? []).map((row: any) => ({
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
        }));

        void logAudit({
            actor_id: session.staffId,
            actor_type: "staff",
            action: "READ",
            resource_type: "health_sync",
            resource_id: patientId,
        });

        return NextResponse.json({
            success: true,
            data: {
                latest: items[0] ?? null,
                recent: items,
                count: countResult.count ?? items.length,
            },
        });
    } catch (error) {
        console.error("Staff health sync fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
