import nodemailer from "nodemailer";

type AppointmentStatusEmailInput = {
    to: string;
    patientName: string;
    facilityName: string;
    appointmentDate: string;
    appointmentTime: string;
    status: "CONFIRMED" | "CANCELLED";
};

let transporterPromise: Promise<nodemailer.Transporter | null> | null = null;

function getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure = String(process.env.SMTP_SECURE ?? "true") === "true";
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const from = process.env.SMTP_FROM?.trim() || user;

    if (!host || !user || !pass || !from || !Number.isFinite(port)) {
        return null;
    }

    return { host, port, secure, user, pass, from };
}

async function getTransporter() {
    if (transporterPromise) {
        return transporterPromise;
    }

    transporterPromise = (async () => {
        const config = getSmtpConfig();
        if (!config) {
            return null;
        }

        const transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass,
            },
        });

        await transporter.verify();
        return transporter;
    })().catch((error) => {
        console.error("SMTP transporter setup failed", error);
        transporterPromise = null;
        return null;
    });

    return transporterPromise;
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatAppointmentDate(value: string) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatAppointmentTime(value: string) {
    const [hours = "00", minutes = "00"] = value.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export async function sendAppointmentStatusEmail(
    input: AppointmentStatusEmailInput
) {
    const config = getSmtpConfig();
    if (!config) {
        console.warn(
            "SMTP email skipped because SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM are not fully configured."
        );
        return;
    }

    const transporter = await getTransporter();
    if (!transporter) {
        throw new Error("SMTP transporter is unavailable");
    }

    const appointmentDate = formatAppointmentDate(input.appointmentDate);
    const appointmentTime = formatAppointmentTime(input.appointmentTime);
    const patientName = input.patientName.trim() || "Patient";
    const facilityName = input.facilityName.trim() || "your healthcare facility";

    const subject =
        input.status === "CONFIRMED"
            ? "Your appointment has been confirmed"
            : "Your appointment has been cancelled";

    const text =
        input.status === "CONFIRMED"
            ? `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been confirmed.`
            : `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been cancelled. Please contact the facility if you need to reschedule.`;

    const html =
        input.status === "CONFIRMED"
            ? `<p>Hi ${escapeHtml(
                  patientName
              )},</p><p>Your appointment at <strong>${escapeHtml(
                  facilityName
              )}</strong> on <strong>${escapeHtml(
                  appointmentDate
              )}</strong> at <strong>${escapeHtml(
                  appointmentTime
              )}</strong> has been confirmed.</p>`
            : `<p>Hi ${escapeHtml(
                  patientName
              )},</p><p>Your appointment at <strong>${escapeHtml(
                  facilityName
              )}</strong> on <strong>${escapeHtml(
                  appointmentDate
              )}</strong> at <strong>${escapeHtml(
                  appointmentTime
              )}</strong> has been cancelled.</p><p>Please contact the facility if you need to reschedule.</p>`;

    await transporter.sendMail({
        from: config.from,
        to: input.to,
        subject,
        text,
        html,
    });
}
