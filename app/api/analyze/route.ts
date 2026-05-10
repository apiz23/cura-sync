import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";

const MAX_SYMPTOM_LENGTH = 1000;
const AUTH_ANALYZE_TIMEOUT_MS = 45000;

function isTimeoutError(err: unknown) {
	return (
		err instanceof Error &&
		(err.name === "TimeoutError" ||
			err.name === "AbortError" ||
			err.message.includes("aborted due to timeout"))
	);
}

export async function POST(req: NextRequest) {
	try {
		const session = await requireAnySession(req);
		if (session instanceof NextResponse) return session;

		const { symptoms, patient_context } = await req.json();

		if (!symptoms || !symptoms.trim()) {
			return NextResponse.json(
				{ error: "Symptoms cannot be empty" },
				{ status: 400 },
			);
		}

		if (symptoms.trim().length > MAX_SYMPTOM_LENGTH) {
			return NextResponse.json(
				{ error: `Symptoms input is limited to ${MAX_SYMPTOM_LENGTH} characters.` },
				{ status: 400 },
			);
		}

		const aiRes = await fetch(
			`${process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"}/analyze`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ symptoms, patient_context }),
				signal: AbortSignal.timeout(AUTH_ANALYZE_TIMEOUT_MS),
			},
		);

		if (!aiRes.ok) {
			const errData = await aiRes.json().catch(() => null);
			return NextResponse.json(
				{ error: errData?.detail || errData?.error || "Failed to analyze symptoms" },
				{ status: aiRes.status || 500 },
			);
		}

		const data = await aiRes.json();
		const urgency =
			typeof data.urgency === "string" ? data.urgency.toLowerCase() : "unknown";

		return NextResponse.json({
			possible_disease: data.possible_disease,
			confidence_level: data.confidence_level,
			urgency:
				urgency === "emergency" ||
				urgency === "high" ||
				urgency === "medium" ||
				urgency === "low"
					? urgency
					: "unknown",
			suggested_action: data.suggested_action,
			disclaimer: data.disclaimer,
			timestamp: data.timestamp,
			source: data.source,
			normalized_symptoms: Array.isArray(data.normalized_symptoms)
				? data.normalized_symptoms
				: [],
		});
	} catch (err: unknown) {
		if (isTimeoutError(err)) {
			return NextResponse.json(
				{
					error:
						"Analysis is taking longer than expected. Signed-in analysis has no demo usage cap, but the AI service may still be warming up. Please try again in a moment.",
				},
				{ status: 504 },
			);
		}
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unknown error" }, { status: 500 });
	}
}
