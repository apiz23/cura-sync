import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";

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

		const aiRes = await fetch(
			`${process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"}/analyze`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ symptoms, patient_context }),
			},
		);

		if (!aiRes.ok) {
			const errData = await aiRes.json().catch(() => null);
			return NextResponse.json(
				{ error: errData?.detail || "Failed to analyze symptoms" },
				{ status: 500 },
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
			normalized_symptoms: Array.isArray(data.normalized_symptoms)
				? data.normalized_symptoms
				: [],
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 });
		}
		return NextResponse.json({ error: "Unknown error" }, { status: 500 });
	}
}
