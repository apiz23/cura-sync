import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";

export async function POST(req: NextRequest) {
	try {
		const session = await requireAnySession(req);
		if (session instanceof NextResponse) return session;

		const body = await req.json();
		const { symptoms, was_accurate, possible_disease, correct_condition, session_id } = body;

		if (!symptoms || !possible_disease) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const aiRes = await fetch(
			`${process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"}/feedback`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symptoms, was_accurate, possible_disease, correct_condition, session_id }),
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
