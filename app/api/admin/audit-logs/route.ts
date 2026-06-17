import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";
import { requireAdminStaffSession } from "@/lib/authz";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;
const EXPORT_LIMIT = 5000;

function parseIntParam(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
    const session = await requireAdminStaffSession(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);

    const isExport = searchParams.get("export") === "true";
    const page = Math.max(1, parseIntParam(searchParams.get("page"), 1));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseIntParam(searchParams.get("limit"), DEFAULT_LIMIT)));
    const offset = (page - 1) * limit;

    const actorType = searchParams.get("actor_type");
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resource_type");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // ── Facility scope ───────────────────────────────────────────────────────
    // cura_audit_logs has no facility_id column, so we resolve which actor IDs
    // belong to this facility via their respective profile tables.
    const [staffScope, appointmentScope] = await Promise.all([
        // All staff who belong to this facility
        supabaseAdmin
            .from("cura_staff_profiles")
            .select("id")
            .eq("facility_id", session.facilityId),
        // All patients who have ever had an appointment at this facility
        supabaseAdmin
            .from("cura_appointments")
            .select("profile_id")
            .eq("facility_id", session.facilityId),
    ]);

    const facilityStaffIds = (staffScope.data ?? []).map((s) => String(s.id));
    const facilityPatientIds = [
        ...new Set(
            (appointmentScope.data ?? [])
                .map((a) => String(a.profile_id))
                .filter(Boolean),
        ),
    ];
    const scopedActorIds = [...new Set([...facilityStaffIds, ...facilityPatientIds])];

    // No actors found for this facility — return empty rather than leaking cross-facility data.
    if (scopedActorIds.length === 0) {
        return NextResponse.json({ data: [], total: 0, page: 1, limit, pages: 0 });
    }

    // ── Query ────────────────────────────────────────────────────────────────
    // supabaseAdmin (service role) bypasses RLS so SELECT works.
    // cura_audit_logs only has an INSERT policy; reads require service role.
    let query = supabaseAdmin
        .from("cura_audit_logs")
        .select("id, actor_id, actor_type, action, resource_type, resource_id, metadata, created_at", { count: "exact" })
        .in("actor_id", scopedActorIds)
        .order("created_at", { ascending: false });

    if (actorType === "staff" || actorType === "patient") {
        query = query.eq("actor_type", actorType);
    }
    if (action && ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT"].includes(action)) {
        query = query.eq("action", action);
    }
    if (resourceType) {
        query = query.eq("resource_type", resourceType);
    }
    if (from) {
        query = query.gte("created_at", new Date(from).toISOString());
    }
    if (to) {
        const toDate = new Date(to);
        toDate.setUTCHours(23, 59, 59, 999);
        query = query.lte("created_at", toDate.toISOString());
    }

    // Apply pagination or export limit
    if (isExport) {
        query = query.limit(EXPORT_LIMIT);
    } else {
        query = query.range(offset, offset + limit - 1);
    }

    const { data: rows, error, count } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const logs = rows ?? [];

    // ── Resolve actor names (batch, no N+1) ──────────────────────────────────
    const staffIds = [...new Set(logs.filter((r) => r.actor_type === "staff").map((r) => r.actor_id))];
    const patientIds = [...new Set(logs.filter((r) => r.actor_type === "patient").map((r) => r.actor_id))];

    const [staffResult, patientResult] = await Promise.all([
        staffIds.length
            ? supabaseAdmin.from("cura_staff_profiles").select("id, full_name").in("id", staffIds)
            : Promise.resolve({ data: [] }),
        patientIds.length
            ? supabaseAdmin.from("cura_profiles").select("id, full_name").in("id", patientIds)
            : Promise.resolve({ data: [] }),
    ]);

    const staffNames = new Map((staffResult.data ?? []).map((s: any) => [String(s.id), s.full_name as string | null]));
    const patientNames = new Map((patientResult.data ?? []).map((p: any) => [p.id as string, p.full_name as string | null]));

    const data = logs.map((row) => ({
        id: row.id,
        actor_id: row.actor_id,
        actor_name:
            row.actor_type === "staff"
                ? (staffNames.get(row.actor_id) ?? null)
                : (patientNames.get(row.actor_id) ?? null),
        actor_type: row.actor_type,
        action: row.action,
        resource_type: row.resource_type,
        resource_id: row.resource_id ?? null,
        metadata: row.metadata ?? null,
        created_at: row.created_at,
    }));

    const total = count ?? logs.length;

    if (isExport) {
        return NextResponse.json({
            data,
            total,
            page: 1,
            limit: EXPORT_LIMIT,
            pages: 1,
        });
    }

    return NextResponse.json({
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    });
}
