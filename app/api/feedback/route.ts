import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";
import { curaSyncAiUrl } from "@/lib/cura-sync-ai";
import supabaseAdmin from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
	try {
		const session = await requireAnySession(req);
		if (session instanceof NextResponse) return session;

		const body = await req.json();
		const { symptoms, was_accurate, possible_disease, correct_condition, source, session_id } = body;

		if (!symptoms || !possible_disease) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const profileId =
			session.kind === "patient" ? session.profileId : null;

		// Save to Supabase
		await supabaseAdmin.from("cura_symptom_feedback").insert({
			profile_id: profileId,
			symptoms,
			possible_disease,
			was_accurate,
			correct_condition: correct_condition ?? null,
			source: source ?? null,
		});

		// Also forward to AI service for in-memory stats (best-effort)
		try {
			await fetch(curaSyncAiUrl("/feedback"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symptoms, was_accurate, possible_disease, correct_condition, session_id }),
				cache: "no-store",
				signal: AbortSignal.timeout(5000),
			});
		} catch {
			// non-critical — DB save already succeeded
		}

		return NextResponse.json({ received: true, message: "Feedback recorded. Thank you." });
	} catch (err: unknown) {
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unknown error" }, { status: 500 });
	}
}
