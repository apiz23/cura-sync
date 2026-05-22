import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { curaSyncAiBaseUrl, curaSyncAiUrl } from "@/lib/cura-sync-ai";

export async function GET() {
    const [dbResult, aiResult] = await Promise.allSettled([
        supabase.from("cura_facilities").select("id").limit(1),
        fetch(
            curaSyncAiUrl("/health"),
            { cache: "no-store", signal: AbortSignal.timeout(5000) },
        ),
    ]);

    const supabaseOk = dbResult.status === "fulfilled" && !dbResult.value.error;
    const aiOk = aiResult.status === "fulfilled" && aiResult.value.ok;

    const overallStatus = supabaseOk && aiOk ? "ok" : "degraded";

    return NextResponse.json(
        {
            status: overallStatus,
            services: {
                supabase: supabaseOk ? "ok" : "error",
                ai_service: aiOk ? "ok" : "error",
            },
            ai_service_url: curaSyncAiBaseUrl,
            timestamp: new Date().toISOString(),
        },
        { status: overallStatus === "ok" ? 200 : 503 },
    );
}
