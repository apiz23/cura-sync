import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

type PatientProfileInput = {
    date_of_birth?: string | null;
    gender?: string | null;
    blood_type?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    allergies?: string | null;
    chronic_conditions?: string | null;
    emergency_contact?: string | null;
};

type ProfilePatchBody = {
    full_name?: string;
    phone?: string | null;
    phone_number?: string | null;
    patient_profile?: PatientProfileInput;
};

async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from("cura_profiles")
        .select(
            `
            id,
            email,
            full_name,
            role,
            avatar_url,
            phone_number,
            created_at,
            updated_at,
            patient_profile:cura_patient_profiles(*)
        `
        )
        .eq("id", userId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const patientProfile = Array.isArray(data.patient_profile)
        ? (data.patient_profile[0] ?? null)
        : data.patient_profile ?? null;

    return {
        ...data,
        phone: data.phone_number ?? null,
        patient_profile: patientProfile,
    };
}

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const profile = await fetchProfile(userId);
        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("GET profile error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = (await req.json()) as ProfilePatchBody;
        const { full_name, phone, phone_number, patient_profile } = body;

        if (!full_name || full_name.trim() === "") {
            return NextResponse.json(
                { error: "Full name is required" },
                { status: 400 }
            );
        }

        const normalizedPhone = (phone_number ?? phone ?? "").trim() || null;

        const { error: profileError } = await supabase
            .from("cura_profiles")
            .update({
                full_name: full_name.trim(),
                phone_number: normalizedPhone,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (profileError) {
            return NextResponse.json(
                { error: profileError.message },
                { status: 400 }
            );
        }

        if (patient_profile) {
            const sanitizedPatientProfile = {
                profile_id: userId,
                date_of_birth: patient_profile.date_of_birth || null,
                gender: patient_profile.gender?.trim() || null,
                blood_type: patient_profile.blood_type?.trim() || null,
                height_cm:
                    patient_profile.height_cm === null ||
                    patient_profile.height_cm === undefined ||
                    Number.isNaN(patient_profile.height_cm)
                        ? null
                        : patient_profile.height_cm,
                weight_kg:
                    patient_profile.weight_kg === null ||
                    patient_profile.weight_kg === undefined ||
                    Number.isNaN(patient_profile.weight_kg)
                        ? null
                        : patient_profile.weight_kg,
                allergies: patient_profile.allergies?.trim() || null,
                chronic_conditions:
                    patient_profile.chronic_conditions?.trim() || null,
                emergency_contact:
                    patient_profile.emergency_contact?.trim() || null,
                updated_at: new Date().toISOString(),
            };

            const { error: patientProfileError } = await supabase
                .from("cura_patient_profiles")
                .upsert(sanitizedPatientProfile, {
                    onConflict: "profile_id",
                });

            if (patientProfileError) {
                return NextResponse.json(
                    { error: patientProfileError.message },
                    { status: 400 }
                );
            }
        }

        const profile = await fetchProfile(userId);
        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("PATCH profile error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
