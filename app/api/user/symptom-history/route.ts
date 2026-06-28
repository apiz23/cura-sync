import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase-admin";
import { requirePatientSession } from "@/lib/authz";

type SymptomAnalysisRow = {
	id: string;
	symptoms_text: string;
	possible_disease: string | null;
	confidence_level: string | null;
	urgency: string;
	suggested_action: string | null;
	source: string | null;
	normalized_symptoms: string[];
	iot_flags: string[];
	created_at: string;
};

function parseLimit(url: string) {
	const raw = new URL(url).searchParams.get("limit");
	const value = raw ? Number(raw) : 20;

	if (!Number.isFinite(value)) {
		return 20;
	}

	return Math.min(Math.max(Math.trunc(value), 1), 50);
}

export async function OPTIONS() {
	return NextResponse.json({}, { status: 200 });
}

export async function GET(req: Request) {
	try {
		const patient = await requirePatientSession(req);
		if (patient instanceof NextResponse) return patient;

		const limit = parseLimit(req.url);

		const itemsResult = await supabaseAdmin
			.from("cura_symptom_analyses")
			.select(
				`
				id,
				symptoms_text,
				possible_disease,
				confidence_level,
				urgency,
				suggested_action,
				source,
				normalized_symptoms,
				iot_flags,
				created_at
				`,
			)
			.eq("profile_id", patient.profileId)
			.order("created_at", { ascending: false })
			.limit(limit);

		if (itemsResult.error) {
			return NextResponse.json(
				{ error: itemsResult.error.message },
				{ status: 500 },
			);
		}

		const countResult = await supabaseAdmin
			.from("cura_symptom_analyses")
			.select("id", { count: "exact", head: true })
			.eq("profile_id", patient.profileId);

		if (countResult.error) {
			return NextResponse.json(
				{ error: countResult.error.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				items: (itemsResult.data ?? []) as SymptomAnalysisRow[],
				count: countResult.count ?? 0,
			},
		});
	} catch (error) {
		console.error("Symptom history fetch error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
