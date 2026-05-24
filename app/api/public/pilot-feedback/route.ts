import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import supabaseAdmin from "@/lib/supabase-admin";

// ── Validation schema ────────────────────────────────────────────────────────

const ROLES = [
    "Doctor",
    "Staff / Receptionist",
    "Patient",
    "Caregiver",
    "Other",
] as const;

const SUITABLE = ["Yes", "Maybe", "No"] as const;

const susRating = () =>
    z.number().int().min(1).max(5);

export const pilotFeedbackSchema = z.object({
    email: z.string().email("A valid email address is required."),
    role: z.enum(ROLES, { error: "Please select your role." }),
    used_during_session: z.boolean({
        error: "Please indicate whether you used CuraSync during the session.",
    }),
    tested_parts: z.array(z.string()).default([]),

    sus_q4:  susRating(),
    sus_q5:  susRating(),
    sus_q6:  susRating(),
    sus_q7:  susRating(),
    sus_q8:  susRating(),
    sus_q9:  susRating(),
    sus_q10: susRating(),
    sus_q11: susRating(),
    sus_q12: susRating(),
    sus_q13: susRating(),

    liked_most:             z.string().max(2000).optional().default(""),
    confusing_parts:        z.string().max(2000).optional().default(""),
    errors_faced:           z.string().max(2000).optional().default(""),
    suggested_improvements: z.string().max(2000).optional().default(""),

    suitable_for_clinic: z.enum(SUITABLE, {
        error: "Please indicate whether CuraSync is suitable for clinic use.",
    }),
});

export type PilotFeedbackInput = z.infer<typeof pilotFeedbackSchema>;

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);
        if (!body) {
            return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const parsed = pilotFeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed.", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const d = parsed.data;

        const { error } = await supabaseAdmin.from("cura_pilot_feedback").insert({
            email:                  d.email,
            role:                   d.role,
            used_during_session:    d.used_during_session,
            tested_parts:           d.tested_parts,
            sus_q4:                 d.sus_q4,
            sus_q5:                 d.sus_q5,
            sus_q6:                 d.sus_q6,
            sus_q7:                 d.sus_q7,
            sus_q8:                 d.sus_q8,
            sus_q9:                 d.sus_q9,
            sus_q10:                d.sus_q10,
            sus_q11:                d.sus_q11,
            sus_q12:                d.sus_q12,
            sus_q13:                d.sus_q13,
            liked_most:             d.liked_most || null,
            confusing_parts:        d.confusing_parts || null,
            errors_faced:           d.errors_faced || null,
            suggested_improvements: d.suggested_improvements || null,
            suitable_for_clinic:    d.suitable_for_clinic,
        });

        if (error) {
            console.error("[pilot-feedback] Supabase insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[pilot-feedback] Unexpected error:", err);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
