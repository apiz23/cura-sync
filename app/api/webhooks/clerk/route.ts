import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookRequiredHeaders } from "svix";
import supabaseAdmin from "@/lib/supabase-admin";

export const runtime = "nodejs";

type ClerkEmailAddress = {
	id: string;
	email_address: string;
};

type ClerkUserData = {
	id: string;
	first_name?: string | null;
	last_name?: string | null;
	image_url?: string | null;
	primary_email_address_id?: string | null;
	email_addresses?: ClerkEmailAddress[];
	public_metadata?: Record<string, unknown> | null;
};

type ClerkDeletedData = {
	id: string;
	deleted?: boolean;
};

type ClerkEvent =
	| { type: "user.created" | "user.updated"; data: ClerkUserData }
	| { type: "user.deleted"; data: ClerkDeletedData }
	| { type: string; data: unknown };

const PROFILE_ID_TABLES = [
	"cura_conditions",
	"cura_allergies",
	"cura_medications",
	"cura_medication_logs",
	"cura_appointments",
	"cura_encounters",
	"cura_procedures",
	"cura_health_sync_snapshots",
	"cura_notifications",
	"cura_patient_facilities",
] as const;

export async function POST(req: Request) {
	const secret = process.env.CLERK_WEBHOOK_SECRET;
	if (!secret) {
		return NextResponse.json(
			{ error: "Webhook secret not configured" },
			{ status: 503 }
		);
	}

	const svixId = req.headers.get("svix-id");
	const svixTimestamp = req.headers.get("svix-timestamp");
	const svixSignature = req.headers.get("svix-signature");

	if (!svixId || !svixTimestamp || !svixSignature) {
		return NextResponse.json(
			{ error: "Missing svix headers" },
			{ status: 400 }
		);
	}

	const payload = await req.text();
	const wh = new Webhook(secret);

	let event: ClerkEvent;
	try {
		event = wh.verify(payload, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		} satisfies WebhookRequiredHeaders) as ClerkEvent;
	} catch (err) {
		console.error("Clerk webhook signature failed:", err);
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	try {
		switch (event.type) {
			case "user.created":
			case "user.updated":
				await upsertProfile(event.data as ClerkUserData);
				break;
			case "user.deleted":
				await deleteProfile((event.data as ClerkDeletedData).id);
				break;
			default:
				// ignore unrelated event types
				break;
		}
		return NextResponse.json({ received: true });
	} catch (err) {
		console.error("Clerk webhook handler error:", err);
		return NextResponse.json(
			{ error: "Handler failed" },
			{ status: 500 }
		);
	}
}

async function upsertProfile(user: ClerkUserData) {
	const primaryId = user.primary_email_address_id;
	const primaryEmail =
		user.email_addresses?.find((e) => e.id === primaryId)?.email_address ??
		user.email_addresses?.[0]?.email_address;

	if (!primaryEmail) return;

	const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
	const role =
		String(user.public_metadata?.role ?? "patient").toLowerCase() || "patient";

	const { error } = await supabaseAdmin.from("cura_profiles").upsert(
		{
			id: user.id,
			email: primaryEmail,
			full_name: fullName,
			avatar_url: user.image_url ?? null,
			role,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "id" }
	);

	if (error) throw error;
}

async function deleteProfile(userId: string) {
	// Best-effort cascade. Run row-level deletes; FK cascades on Supabase
	// should handle the rest. Errors logged but not thrown to avoid replay loops.
	await Promise.all(
		PROFILE_ID_TABLES.map(async (table) => {
			const { error } = await supabaseAdmin
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				.from(table as any)
				.delete()
				.eq("profile_id", userId);
			if (error) console.error(`Cleanup failed (${table}):`, error.message);
		})
	);

	await supabaseAdmin
		.from("cura_patient_profiles")
		.delete()
		.eq("profile_id", userId);

	const { error } = await supabaseAdmin
		.from("cura_profiles")
		.delete()
		.eq("id", userId);

	if (error) throw error;
}
