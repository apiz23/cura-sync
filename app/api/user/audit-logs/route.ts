import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { requirePatientSession } from "@/lib/authz";

export async function GET(req: Request) {
    try {
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const { data, error } = await supabase
            .from("cura_audit_logs")
            .select("id, actor_id, actor_type, action, resource_type, resource_id, created_at")
            .eq("actor_id", patient.profileId)
            .eq("actor_type", "patient")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data ?? [] });
    } catch (error) {
        console.error("GET /api/user/audit-logs error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
