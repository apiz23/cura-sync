import supabase from "@/lib/supabase";
import type { AnySession } from "@/lib/authz";

type AuditAction = "CREATE" | "READ" | "UPDATE" | "DELETE";

interface AuditEntry {
    actor_id: string;
    actor_type: "staff" | "patient";
    action: AuditAction;
    resource_type: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
}

export function actorFromSession(session: AnySession): Pick<AuditEntry, "actor_id" | "actor_type"> {
    if (session.kind === "staff") {
        return { actor_id: session.staffId, actor_type: "staff" };
    }
    return { actor_id: session.profileId, actor_type: "patient" };
}

export async function logAudit(entry: AuditEntry): Promise<void> {
    try {
        await supabase.from("cura_audit_logs").insert({
            actor_id: entry.actor_id,
            actor_type: entry.actor_type,
            action: entry.action,
            resource_type: entry.resource_type,
            resource_id: entry.resource_id ?? null,
            metadata: entry.metadata ?? null,
        });
    } catch {
        // Fire-and-forget — audit failure must never break a request
    }
}
