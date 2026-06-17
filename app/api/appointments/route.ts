import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";
import { requireAnySession, requirePatientSession } from "@/lib/authz";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

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

const bookAppointmentSchema = z.object({
    facility_id: z.string().trim().min(1),
    appointment_date: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "appointment_date must be YYYY-MM-DD"),
    start_time: z.string().trim().min(1),
    end_time: z.string().trim().optional(),
    reason_for_visit: z.string().trim().max(500).optional(),
});

type FacilityScheduleRow = {
    id: string;
    facility_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number | null;
};

function toMinutes(time: string) {
    const match = String(time ?? "").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
}

function fromMinutes(total: number) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function computeDayOfWeek(dateStr: string) {
    // Date-only strings are treated as UTC by JS Date parsing. We keep that behavior consistent.
    const d = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return null;
    return d.getUTCDay(); // 0..6 (Sun..Sat)
}

function isBeforeTomorrowUtc(dateStr: string) {
    const target = new Date(`${dateStr}T00:00:00Z`);
    if (Number.isNaN(target.getTime())) return true;
    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrowUtc = new Date(todayUtc);
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);
    return target.getTime() < tomorrowUtc.getTime();
}

function buildSlots(schedules: FacilityScheduleRow[]) {
    const slots = new Map<string, { start: string; end: string }>();

    for (const schedule of schedules) {
        const duration = schedule.slot_duration_minutes ?? 60;
        if (!Number.isFinite(duration) || duration <= 0) continue;

        const startMin = toMinutes(schedule.start_time);
        const endMin = toMinutes(schedule.end_time);
        if (startMin === null || endMin === null) continue;
        if (endMin <= startMin) continue;

        for (let t = startMin; t + duration <= endMin; t += duration) {
            const start = fromMinutes(t);
            const end = fromMinutes(t + duration);
            slots.set(start, { start, end });
        }
    }

    return slots;
}

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
        const patient = await requirePatientSession(req);
        if (patient instanceof NextResponse) return patient;

        const parsed = bookAppointmentSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid booking payload", details: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const { facility_id, appointment_date, start_time, end_time, reason_for_visit } = parsed.data;

        if (isBeforeTomorrowUtc(appointment_date)) {
            return NextResponse.json(
                { error: "Please choose a future date starting from tomorrow." },
                { status: 400 },
            );
        }

        // Facility must exist and be active for booking.
        const { data: facility, error: facilityError } = await supabase
            .from("cura_facilities")
            .select("id, is_active")
            .eq("id", facility_id)
            .maybeSingle();

        if (facilityError) {
            return NextResponse.json({ error: "Facility lookup failed" }, { status: 500 });
        }

        if (!facility?.id) {
            return NextResponse.json({ error: "Facility not found" }, { status: 404 });
        }

        if (facility.is_active === false) {
            return NextResponse.json({ error: "Facility is not accepting bookings" }, { status: 400 });
        }

        const dayOfWeek = computeDayOfWeek(appointment_date);
        if (dayOfWeek === null) {
            return NextResponse.json({ error: "Invalid appointment_date" }, { status: 400 });
        }

        const { data: schedules, error: scheduleError } = await supabase
            .from("cura_facility_schedules")
            .select("id, facility_id, day_of_week, start_time, end_time, slot_duration_minutes")
            .eq("facility_id", facility_id)
            .eq("day_of_week", dayOfWeek);

        if (scheduleError) {
            return NextResponse.json({ error: "Facility schedule lookup failed" }, { status: 500 });
        }

        const slotMap = buildSlots(((schedules as FacilityScheduleRow[]) ?? []) as FacilityScheduleRow[]);
        if (slotMap.size === 0) {
            return NextResponse.json(
                { error: "No available schedule for the selected day." },
                { status: 400 },
            );
        }

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

        const allowed = slotMap.get(times.startTime);
        if (!allowed) {
            return NextResponse.json(
                { error: "Selected time is not available for this facility schedule." },
                { status: 400 },
            );
        }

        if (times.endTime !== allowed.end) {
            return NextResponse.json(
                { error: "Selected slot duration does not match facility schedule." },
                { status: 400 },
            );
        }

        const { data: existingBooking, error: checkError } = await supabase
            .from("cura_appointments")
            .select("id")
            .eq("facility_id", facility_id)
            .eq("appointment_date", appointment_date)
            .eq("start_time", times.startTime)
            .in("status", ["PENDING", "CONFIRMED", "CHECKED_IN"])
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
                    // Status model: booking creates a request, staff confirms.
                    status: "PENDING",
                },
            ])
            .select()
            .single();

        if (error) {
            // If the DB unique index is in place, concurrent booking attempts can fail here.
            // Normalize that into the same user-facing 409 flow.
            const errAny = error as unknown as { code?: string; message?: string };
            if (errAny?.code === "23505") {
                return NextResponse.json(
                    { error: "Sorry, this slot was just booked by someone else." },
                    { status: 409 },
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        void logAudit({
            actor_id: patient.profileId,
            actor_type: "patient",
            action: "CREATE",
            resource_type: "appointment",
            resource_id: data.id,
            metadata: { facility_id, appointment_date },
        });

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
