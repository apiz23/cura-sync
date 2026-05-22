import { NextRequest, NextResponse } from "next/server";
import { curaSyncAiUrl } from "@/lib/cura-sync-ai";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { symptoms, was_accurate, possible_disease, correct_condition } = body;

		if (!symptoms || !possible_disease) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const aiRes = await fetch(
			curaSyncAiUrl("/feedback"),
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symptoms, was_accurate, possible_disease, correct_condition }),
				cache: "no-store",
				signal: AbortSignal.timeout(8000),
			},
		);

		const data = await aiRes.json().catch(() => ({ received: false }));
		return NextResponse.json(data);
	} catch (err: unknown) {
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unknown error" }, { status: 500 });
	}
}
