import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import {
    requireAnySession,
    type AnySession,
    type StaffSession,
} from "@/lib/authz";

function canManagePrescriptions(
    session: AnySession | NextResponse
): session is StaffSession {
    return (
        !(session instanceof NextResponse) &&
        session.kind === "staff" &&
        (session.role === "doctor" || session.role === "admin")
    );
}

/* =========================
   GET /api/medications
   ========================= */
export async function GET(req: NextRequest) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(req.url);
    const profileId =
        session.kind === "patient"
            ? session.profileId
            : searchParams.get("profile_id");

    if (session.kind === "staff") {
        if (!profileId) {
            return NextResponse.json(
                { error: "profile_id is required" },
                { status: 400 }
            );
        }

        const { data: reg, error: regError } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("profile_id", profileId)
            .eq("facility_id", session.facilityId)
            .eq("status", "active")
            .maybeSingle();

        if (regError) {
            return NextResponse.json(
                { error: "Access check failed" },
                { status: 500 }
            );
        }

        if (!reg) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/* =========================
   POST /api/medications
   ========================= */
export async function POST(req: NextRequest) {
    const session = await requireAnySession(req);
    if (session instanceof NextResponse) return session;

    if (!canManagePrescriptions(session)) {
        return NextResponse.json(
            { error: "Only doctors or admins can create prescriptions" },
            { status: 403 }
        );
    }

    const body = await req.json();

    const {
        profile_id,
        name,
        dosage,
        frequency,
        schedule,
        start_date,
        end_date,
        notes,
        prescribed_by,
    } = body;

    const effectiveProfileId = profile_id;

    if (
        !effectiveProfileId ||
        !name ||
        !dosage ||
        !frequency ||
        !schedule ||
        !start_date
    ) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    const { data: reg, error: regError } = await supabase
        .from("cura_patient_facilities")
        .select("id")
        .eq("profile_id", effectiveProfileId)
        .eq("facility_id", session.facilityId)
        .eq("status", "active")
        .maybeSingle();

    if (regError) {
        return NextResponse.json(
            { error: "Access check failed" },
            { status: 500 }
        );
    }

    if (!reg) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .insert({
            profile_id: effectiveProfileId,
            name,
            dosage,
            frequency,
            schedule,
            start_date,
            end_date,
            notes,
            prescribed_by,
            status: "ACTIVE",
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}
