import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAnySession, requirePatientSession } from "@/lib/authz";

/* =========================
   Types
========================= */
type AppointmentApiRow = {
    id: string;
    profile_id: string | null;
    facility_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    reason_for_visit: string | null;
    created_at: string;
};

type ProfileLookupRow = {
    id: string;
    full_name: string | null;
};

type FacilityLookupRow = {
    id: string;
    name: string | null;
};

/* =========================
   GET
========================= */
export async function GET(req: Request) {
    try {
        const session = await requireAnySession(req);
        if (session instanceof NextResponse) return session;

        const { searchParams } = new URL(req.url);

        const facility_id = searchParams.get("facility_id");
        const profile_id = searchParams.get("profile_id");
        const date = searchParams.get("date");

        let query = supabase
            .from("cura_appointments")
            .select(
                `
                id,
                profile_id,
                facility_id,
                appointment_date,
                start_time,
                end_time,
                status,
                reason_for_visit,
                created_at
            `
            )
            .order("appointment_date", { ascending: true })
            .order("start_time", { ascending: true });

        if (session.kind === "patient") {
            query = query.eq("profile_id", session.profileId);
        } else {
            // staff (facility-scoped)
            const facilityFilter = facility_id ?? session.facilityId;
            if (facilityFilter !== session.facilityId) {
                return NextResponse.json(
                    { error: "Forbidden" },
                    { status: 403 }
                );
            }
            query = query.eq("facility_id", facilityFilter);

            if (profile_id) query = query.eq("profile_id", profile_id);
        }

        if (date) query = query.eq("appointment_date", date);

        const { data, error } = await query;

        if (error) {
            console.error("Fetch appointments error:", error);
            return NextResponse.json(
                { error: "Failed to fetch appointments" },
                { status: 500 }
            );
        }

        const rows = (data as AppointmentApiRow[] | null) ?? [];
        const profileIds = Array.from(
            new Set(
                rows
                    .map((appointment) => appointment.profile_id)
                    .filter((value): value is string => Boolean(value))
            )
        );
        const facilityIds = Array.from(
            new Set(
                rows
                    .map((appointment) => appointment.facility_id)
                    .filter((value): value is string => Boolean(value))
            )
        );

        const [profilesResult, facilitiesResult] = await Promise.all([
            profileIds.length
                ? supabase
                      .from("cura_profiles")
                      .select("id, full_name")
                      .in("id", profileIds)
                : Promise.resolve({ data: [], error: null }),
            facilityIds.length
                ? supabase
                      .from("cura_facilities")
                      .select("id, name")
                      .in("id", facilityIds)
                : Promise.resolve({ data: [], error: null }),
        ]);

        if (profilesResult.error || facilitiesResult.error) {
            console.error("Fetch appointment relations error:", {
                profilesError: profilesResult.error,
                facilitiesError: facilitiesResult.error,
            });
            return NextResponse.json(
                { error: "Failed to fetch appointments" },
                { status: 500 }
            );
        }

        const profileMap = new Map(
            ((profilesResult.data as ProfileLookupRow[] | null) ?? []).map(
                (profile) => [profile.id, profile.full_name]
            )
        );
        const facilityMap = new Map(
            ((facilitiesResult.data as FacilityLookupRow[] | null) ?? []).map(
                (facility) => [facility.id, facility.name]
            )
        );

        const formatted = rows.map((appt) => ({
            ...appt,
            patient_name: appt.profile_id
                ? profileMap.get(appt.profile_id) ?? "Unknown Patient"
                : "Unknown Patient",
            facility_name: appt.facility_id
                ? facilityMap.get(appt.facility_id) ?? "Unknown Facility"
                : "Unknown Facility",
        }));

        return NextResponse.json({ data: formatted }, { status: 200 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

/* =========================
   Helpers
========================= */
function processTimes(startStr: string, endStr?: string) {
    try {
        const startDate = new Date(`2000-01-01 ${startStr}`);
        if (isNaN(startDate.getTime())) return null;

        const formattedStartTime = startDate.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });

        let formattedEndTime: string;

        if (endStr) {
            const endDate = new Date(`2000-01-01 ${endStr}`);
            if (isNaN(endDate.getTime())) return null;

            formattedEndTime = endDate.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            startDate.setHours(startDate.getHours() + 1);
            formattedEndTime = startDate.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        return { startTime: formattedStartTime, endTime: formattedEndTime };
    } catch {
        return null;
    }
}

/* =========================
   POST
========================= */
export async function POST(req: Request) {
    try {
        const patient = await requirePatientSession();
        if (patient instanceof NextResponse) return patient;

        const body = await req.json();

        const {
            facility_id,
            appointment_date,
            start_time,
            end_time,
            reason_for_visit,
        } = body as {
            profile_id?: string;
            facility_id?: string;
            appointment_date?: string;
            start_time?: string;
            end_time?: string;
            reason_for_visit?: string;
        };

        if (!facility_id || !appointment_date || !start_time) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Ensure the patient is linked to the facility. If not, create the
        // active facility registration during booking so the user journey
        // does not depend on prior manual admin registration.
        const { data: registration, error: regError } = await supabase
            .from("cura_patient_facilities")
            .select("id")
            .eq("profile_id", patient.profileId)
            .eq("facility_id", facility_id)
            .maybeSingle();

        if (regError) {
            return NextResponse.json(
                { error: "Registration check failed" },
                { status: 500 }
            );
        }

        if (!registration) {
            const { error: registerError } = await supabase
                .from("cura_patient_facilities")
                .insert({
                    profile_id: patient.profileId,
                    facility_id,
                    status: "active",
                });

            if (registerError) {
                return NextResponse.json(
                    { error: "Unable to register patient to facility" },
                    { status: 500 }
                );
            }
        } else {
            const { error: reactivateError } = await supabase
                .from("cura_patient_facilities")
                .update({ status: "active" })
                .eq("id", registration.id);

            if (reactivateError) {
                return NextResponse.json(
                    { error: "Unable to activate facility registration" },
                    { status: 500 }
                );
            }
        }

        const times = processTimes(start_time, end_time);
        if (!times) {
            return NextResponse.json(
                { error: "Invalid time format" },
                { status: 400 }
            );
        }

        const { data: existingBooking, error: checkError } = await supabase
            .from("cura_appointments")
            .select("id")
            .eq("facility_id", facility_id)
            .eq("appointment_date", appointment_date)
            .eq("start_time", times.startTime)
            .in("status", ["PENDING", "CONFIRMED"])
            .maybeSingle();

        if (checkError) {
            return NextResponse.json(
                { error: "Check failed" },
                { status: 500 }
            );
        }

        if (existingBooking) {
            return NextResponse.json(
                { error: "Sorry, this slot was just booked by someone else." },
                { status: 409 }
            );
        }

        const { data, error } = await supabase
            .from("cura_appointments")
            .insert([
                {
                    profile_id: patient.profileId,
                    facility_id,
                    appointment_date,
                    start_time: times.startTime,
                    end_time: times.endTime,
                    reason_for_visit: reason_for_visit ?? "",
                    status: "CONFIRMED",
                },
            ])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
