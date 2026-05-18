import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { ensureFacilityAccess, requireAnySession, requireStaffSession } from "@/lib/authz";
import { z } from "zod";
import { logAudit } from "@/lib/audit";
import { sendAppointmentStatusEmail } from "@/lib/smtp-mailer";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"]);

async function sendPushIfConfirmed({
    profileId,
    facilityName,
    appointmentDate,
    appointmentTime,
    previousStatus,
    nextStatus,
}: {
    profileId: string | null;
    facilityName: string;
    appointmentDate: string;
    appointmentTime: string;
    previousStatus: string;
    nextStatus: string;
}): Promise<void> {
    if (
        String(previousStatus).toUpperCase() !== "PENDING" ||
        String(nextStatus).toUpperCase() !== "CONFIRMED"
    ) return;

    if (!profileId) return;

    const { data: profile } = await supabase
        .from("cura_profiles")
        .select("expo_push_token")
        .eq("id", profileId)
        .maybeSingle();

    const token = profile?.expo_push_token;
    if (!token) return;

    await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to: token,
            title: "Appointment Confirmed",
            body: `Your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} is confirmed.`,
            data: { type: "APPOINTMENT_CONFIRMED" },
        }),
    });
}

function canTransition(from: string, to: string) {
    const f = String(from ?? "").toUpperCase();
    const t = String(to ?? "").toUpperCase();

    if (f === t) return true;
    if (f === "CANCELLED") return false;
    if (f === "COMPLETED") return false;

    if (f === "PENDING") return t === "CONFIRMED" || t === "CANCELLED";
    if (f === "CONFIRMED") return t === "CHECKED_IN" || t === "CANCELLED";
    if (f === "CHECKED_IN") return t === "COMPLETED" || t === "CANCELLED";

    return false;
}

async function sendPatientStatusEmailIfNeeded({
    profileId,
    facilityId,
    appointmentDate,
    appointmentTime,
    previousStatus,
    nextStatus,
}: {
    profileId: string | null;
    facilityId: string | null;
    appointmentDate: string;
    appointmentTime: string;
    previousStatus: string;
    nextStatus: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";
}) {
    const previous = String(previousStatus ?? "").toUpperCase();
    if (!profileId || !facilityId) return;

    const shouldSendConfirmed = previous === "PENDING" && nextStatus === "CONFIRMED";
    const shouldSendCancelled = nextStatus === "CANCELLED";

    if (!shouldSendConfirmed && !shouldSendCancelled) {
        return;
    }

    const [{ data: patient, error: patientError }, { data: facility, error: facilityError }] =
        await Promise.all([
            supabase
                .from("cura_profiles")
                .select("email, full_name")
                .eq("id", profileId)
                .maybeSingle(),
            supabase
                .from("cura_facilities")
                .select("name")
                .eq("id", facilityId)
                .maybeSingle(),
        ]);

    if (patientError || facilityError) {
        throw new Error(
            patientError?.message || facilityError?.message || "Failed to load email recipients"
        );
    }

    const patientEmail = patient?.email?.trim();
    if (!patientEmail) {
        return;
    }

    await sendAppointmentStatusEmail({
        to: patientEmail,
        patientName: patient?.full_name ?? "Patient",
        facilityName: facility?.name ?? "CuraSync Facility",
        appointmentDate,
        appointmentTime,
        status: shouldSendConfirmed ? "CONFIRMED" : "CANCELLED",
    });
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Patients can cancel their own future appointments.
    const any = await requireAnySession(req);
    if (any instanceof NextResponse) return any;

    const { id } = await params;
    const body = await req.json();

    const { data: existing, error: existingError } = await supabase
        .from("cura_appointments")
        .select("id, facility_id, profile_id, appointment_date, start_time, status")
        .eq("id", id)
        .single();

    if (existingError || !existing) {
        return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (any.kind === "patient") {
        if (existing.profile_id !== any.profileId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const parsed = statusSchema.safeParse(body?.status);
        if (!parsed.success || parsed.data !== "CANCELLED") {
            return NextResponse.json(
                { error: "Patients may only cancel appointments." },
                { status: 400 },
            );
        }

        const apptDate = new Date(`${existing.appointment_date}T00:00:00Z`);
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (Number.isNaN(apptDate.getTime()) || apptDate.getTime() < todayUtc.getTime()) {
            return NextResponse.json(
                { error: "Past appointments cannot be cancelled." },
                { status: 400 },
            );
        }

        if (!canTransition(existing.status, "CANCELLED")) {
            return NextResponse.json(
                { error: "This appointment cannot be cancelled." },
                { status: 400 },
            );
        }

        const { data, error } = await supabase
            .from("cura_appointments")
            .update({ status: "CANCELLED" })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        void logAudit({
            actor_id: any.profileId,
            actor_type: "patient",
            action: "UPDATE",
            resource_type: "appointment",
            resource_id: id,
            metadata: { status: "CANCELLED" },
        });

        return NextResponse.json(data);
    }

    // Staff update flow.
    const session = await requireStaffSession(req);
    if (session instanceof NextResponse) return session;

    const facilityAccess = ensureFacilityAccess(session, existing.facility_id);
    if (facilityAccess instanceof NextResponse) return facilityAccess;

    const parsedStatus = statusSchema.safeParse(body?.status);
    if (!parsedStatus.success) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nextStatus = parsedStatus.data;
    const role = String(session.role ?? "").toLowerCase();

    // Tight role-based permissions (realistic clinic workflow):
    // - staff: confirm/cancel/check-in only
    // - doctor: complete only (after check-in)
    // - admin: override (any status, any transition)
    if (!session.isAdmin) {
        if (
            role === "staff" &&
            nextStatus !== "CONFIRMED" &&
            nextStatus !== "CHECKED_IN" &&
            nextStatus !== "CANCELLED"
        ) {
            return NextResponse.json(
                { error: "Staff may only confirm, check-in, or cancel appointments." },
                { status: 403 },
            );
        }

        if (role === "doctor" && nextStatus !== "COMPLETED") {
            return NextResponse.json(
                { error: "Doctors may only complete appointments." },
                { status: 403 },
            );
        }

        if (role === "doctor" && nextStatus === "COMPLETED" && existing.status !== "CHECKED_IN") {
            return NextResponse.json(
                { error: "Appointment must be checked-in before it can be completed." },
                { status: 400 },
            );
        }

        if (!canTransition(existing.status, nextStatus)) {
            return NextResponse.json(
                { error: `Invalid status transition (${existing.status} -> ${nextStatus})` },
                { status: 400 },
            );
        }
    }

    const payload: Record<string, unknown> = { status: nextStatus };
    // Allow non-staff roles (doctor/admin) to edit the reason field; staff are status-only.
    if (role !== "staff" && typeof body?.reason_for_visit === "string") {
        payload.reason_for_visit = body.reason_for_visit.slice(0, 500);
    }

    const { data, error } = await supabase
        .from("cura_appointments")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void logAudit({
        actor_id: session.staffId,
        actor_type: "staff",
        action: "UPDATE",
        resource_type: "appointment",
        resource_id: id,
        metadata: { status: nextStatus, role: session.role },
    });

    try {
        await sendPatientStatusEmailIfNeeded({
            profileId: existing.profile_id,
            facilityId: existing.facility_id,
            appointmentDate: existing.appointment_date,
            appointmentTime: existing.start_time,
            previousStatus: existing.status,
            nextStatus,
        });
        await sendPushIfConfirmed({
            profileId: existing.profile_id,
            facilityName: "",
            appointmentDate: existing.appointment_date,
            appointmentTime: existing.start_time,
            previousStatus: existing.status,
            nextStatus: nextStatus,
        });
    } catch (emailError) {
        console.error("Failed to send appointment status email", emailError);
    }

    return NextResponse.json(data);
}
