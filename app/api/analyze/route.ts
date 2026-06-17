import { NextRequest, NextResponse } from "next/server";
import { requireAnySession } from "@/lib/authz";
import { curaSyncAiUrl, readAiError } from "@/lib/cura-sync-ai";
import supabaseAdmin from "@/lib/supabase-admin";

const MAX_SYMPTOM_LENGTH = 1000;
const AUTH_ANALYZE_TIMEOUT_MS = 45000;

function finiteNumber(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return undefined;
}

function finiteInteger(value: unknown) {
	const parsed = finiteNumber(value);
	if (parsed === undefined) return undefined;
	return Math.trunc(parsed);
}

function cleanText(value: unknown) {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanPatientContext(value: unknown) {
	if (!value || typeof value !== "object") return undefined;
	const context = value as Record<string, unknown>;
	const cleaned = {
		age: finiteInteger(context.age),
		date_of_birth: cleanText(context.date_of_birth),
		gender: cleanText(context.gender),
		blood_type: cleanText(context.blood_type),
		height_cm: finiteNumber(context.height_cm),
		weight_kg: finiteNumber(context.weight_kg),
		allergies: cleanText(context.allergies),
		chronic_conditions: cleanText(context.chronic_conditions),
	};
	return Object.fromEntries(
		Object.entries(cleaned).filter(([, entry]) => entry !== undefined),
	);
}

function cleanIotData(value: unknown) {
	if (!value || typeof value !== "object") return undefined;
	const readings = value as Record<string, unknown>;
	const cleaned = {
		heart_rate_bpm: finiteNumber(readings.heart_rate_bpm),
		spo2_percent: finiteNumber(readings.spo2_percent),
		sleep_hours: finiteNumber(readings.sleep_hours),
		steps_today: finiteInteger(readings.steps_today),
	};
	const entries = Object.entries(cleaned).filter(
		([, entry]) => entry !== undefined,
	);
	return entries.length ? Object.fromEntries(entries) : undefined;
}

function isTimeoutError(err: unknown) {
	return (
		err instanceof Error &&
		(err.name === "TimeoutError" ||
			err.name === "AbortError" ||
			err.message.includes("aborted due to timeout"))
	);
}

async function enrichContextFromDb(
	profileId: string,
	base: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const enriched = { ...base };

	const [allergiesRes, conditionsRes, patientProfileRes] = await Promise.all([
		supabaseAdmin
			.from("cura_allergies")
			.select("allergen, reaction, severity, status")
			.eq("profile_id", profileId)
			.eq("status", "ACTIVE")
			.limit(10),
		supabaseAdmin
			.from("cura_conditions")
			.select("name, severity, status")
			.eq("profile_id", profileId)
			.in("status", ["ACTIVE", "CHRONIC"])
			.limit(10),
		supabaseAdmin
			.from("cura_patient_profiles")
			.select("date_of_birth, gender, blood_type, height_cm, weight_kg, allergies, chronic_conditions")
			.eq("profile_id", profileId)
			.maybeSingle(),
	]);

	// Merge base patient profile if not already provided by client
	const pp = patientProfileRes.data;
	if (pp) {
		if (!enriched.date_of_birth && pp.date_of_birth) enriched.date_of_birth = pp.date_of_birth;
		if (!enriched.gender && pp.gender) enriched.gender = pp.gender;
		if (!enriched.blood_type && pp.blood_type) enriched.blood_type = pp.blood_type;
		if (enriched.height_cm == null && pp.height_cm != null) enriched.height_cm = pp.height_cm;
		if (enriched.weight_kg == null && pp.weight_kg != null) enriched.weight_kg = pp.weight_kg;
	}

	// Structured allergies override/extend free-text field
	if (allergiesRes.data && allergiesRes.data.length > 0) {
		const allergyLines = allergiesRes.data.map((a) => {
			let line = a.allergen;
			if (a.reaction) line += ` (${a.reaction})`;
			if (a.severity) line += ` — ${a.severity}`;
			return line;
		});
		enriched.allergies = allergyLines.join("; ");
	} else if (!enriched.allergies && pp?.allergies) {
		enriched.allergies = pp.allergies;
	}

	// Structured conditions override/extend free-text field
	if (conditionsRes.data && conditionsRes.data.length > 0) {
		const conditionLines = conditionsRes.data.map((c) => {
			let line = c.name;
			if (c.severity) line += ` (${c.severity})`;
			if (c.status === "CHRONIC") line += " — chronic";
			return line;
		});
		enriched.chronic_conditions = conditionLines.join("; ");
	} else if (!enriched.chronic_conditions && pp?.chronic_conditions) {
		enriched.chronic_conditions = pp.chronic_conditions;
	}

	return Object.fromEntries(
		Object.entries(enriched).filter(([, v]) => v !== undefined && v !== null && v !== ""),
	);
}

export async function POST(req: NextRequest) {
	try {
		const session = await requireAnySession(req);
		if (session instanceof NextResponse) return session;

		const { symptoms, patient_context, iot_data } = await req.json();
		let cleanContext: Record<string, unknown> = cleanPatientContext(patient_context) ?? {};
		const cleanIot = cleanIotData(iot_data);

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

		// Enrich patient context from DB for logged-in patients
		const profileId = session.kind === "patient" ? session.profileId : null;
		if (profileId) {
			cleanContext = await enrichContextFromDb(profileId, cleanContext);
		}

		const aiRes = await fetch(
			curaSyncAiUrl("/analyze"),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					symptoms,
					...(cleanContext && Object.keys(cleanContext).length
						? { patient_context: cleanContext }
						: {}),
					...(cleanIot ? { iot_data: cleanIot } : {}),
				}),
				cache: "no-store",
				signal: AbortSignal.timeout(AUTH_ANALYZE_TIMEOUT_MS),
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
			iot_flags: Array.isArray(data.iot_flags) ? data.iot_flags : [],
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
