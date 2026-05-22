import { NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";
import { curaSyncAiUrl, readAiError } from "@/lib/cura-sync-ai";

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
			curaSyncAiUrl("/chat"),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					session_id: session_id.trim(),
					message: message.trim(),
				}),
				cache: "no-store",
				signal: AbortSignal.timeout(8000),
			},
		);

		if (!res.ok) {
			const errorText = await readAiError(res, "Failed to chat with AI service");
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
