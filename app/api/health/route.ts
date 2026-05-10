import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
    const [dbResult, aiResult] = await Promise.allSettled([
        supabase.from("cura_facilities").select("id").limit(1),
        fetch(
            `${process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"}/health`,
            { signal: AbortSignal.timeout(5000) },
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
            timestamp: new Date().toISOString(),
        },
        { status: overallStatus === "ok" ? 200 : 503 },
    );
}
