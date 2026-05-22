import { NextRequest, NextResponse } from "next/server";
import { curaSyncAiUrl, readAiError } from "@/lib/cura-sync-ai";
import {
	checkPublicDemoLimit,
	getClientIp,
} from "@/lib/public-demo-rate-limit";

const MAX_SYMPTOM_LENGTH = 400;
const PUBLIC_ANALYZE_TIMEOUT_MS = 8000;

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
		const ip = getClientIp(req.headers);
		const limit = checkPublicDemoLimit(ip);

		if (!limit.allowed) {
			return NextResponse.json(
				{
					error:
						"Public demo limit reached. Please try again later or sign in for full access.",
				},
				{
					status: 429,
					headers: {
						"Retry-After": String(
							Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000)),
						),
					},
				},
			);
		}

		const { symptoms, patient_context, iot_data } = await req.json();

		if (!symptoms || !symptoms.trim()) {
			return NextResponse.json(
				{ error: "Symptoms cannot be empty" },
				{ status: 400 },
			);
		}

		const trimmedSymptoms = symptoms.trim();
		if (trimmedSymptoms.length > MAX_SYMPTOM_LENGTH) {
			return NextResponse.json(
				{
					error: `Public demo input is limited to ${MAX_SYMPTOM_LENGTH} characters.`,
				},
				{ status: 400 },
			);
		}

		const aiPayload: Record<string, unknown> = {
			symptoms: trimmedSymptoms,
			patient_context,
		};
		if (iot_data && typeof iot_data === "object" && !Array.isArray(iot_data)) {
			aiPayload.iot_data = iot_data;
		}

		const aiRes = await fetch(
			curaSyncAiUrl("/analyze"),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(aiPayload),
				cache: "no-store",
				signal: AbortSignal.timeout(PUBLIC_ANALYZE_TIMEOUT_MS),
			},
		);

		if (!aiRes.ok) {
			const error = await readAiError(aiRes, "Failed to analyze symptoms");
			return NextResponse.json(
				{ error },
				{ status: aiRes.status || 500 },
			);
		}

		const data = await aiRes.json();
		const urgency =
			typeof data.urgency === "string" ? data.urgency.toLowerCase() : "unknown";

		return NextResponse.json(
			{
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
				source: data.source,
				disclaimer:
					data.disclaimer ||
					"This demo is for informational purposes only and does not replace professional medical advice.",
				normalized_symptoms: Array.isArray(data.normalized_symptoms)
					? data.normalized_symptoms
					: [],
				timestamp: data.timestamp ?? null,
				iot_flags: Array.isArray(data.iot_flags) ? data.iot_flags : [],
			},
			{
				headers: {
					"X-Demo-Requests-Remaining": String(limit.remaining),
				},
			},
		);
	} catch (err: unknown) {
		if (isTimeoutError(err)) {
			return NextResponse.json(
				{
					error:
						"Public demo analysis timed out. Please try again shortly or sign in for the full analyzer experience.",
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
