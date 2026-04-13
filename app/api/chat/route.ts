import { NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";

export async function POST(req: Request) {
	try {
		const session = await requireAnySession(req);
		if (session instanceof NextResponse) return session;

		const { session_id, message } = await req.json();

		if (!session_id || !session_id.trim()) {
			return NextResponse.json(
				{ error: "session_id is required" },
				{ status: 400 },
			);
		}

		if (!message || !message.trim()) {
			return NextResponse.json(
				{ error: "Message cannot be empty" },
				{ status: 400 },
			);
		}

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"}/chat`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					session_id: session_id.trim(),
					message: message.trim(),
				}),
			},
		);

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`FastAPI returned ${res.status}: ${errorText}`);
		}

		const data = await res.json();

		return NextResponse.json({
			reply: data.response,
			session_id: data.session_id ?? session_id.trim(),
		});
	} catch (err) {
		const error = err instanceof Error ? err : new Error(String(err));

		return NextResponse.json(
			{ error: error.message },
			{ status: 500 },
		);
	}
}
