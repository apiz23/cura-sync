import nodemailer from "nodemailer";
import { existsSync } from "node:fs";
import path from "node:path";

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

function getPublicSiteUrl() {
    const explicitUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL?.trim();

    if (explicitUrl) {
        return explicitUrl.replace(/\/+$/, "");
    }

    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) {
        return `https://${vercelUrl.replace(/\/+$/, "")}`;
    }

    return "";
}

function getLogoAttachment() {
    const logoPath = path.join(
        process.cwd(),
        "public",
        "icons",
        "android-chrome-192x192.png"
    );

    if (!existsSync(logoPath)) {
        return null;
    }

    return {
        filename: "cura-sync-logo.png",
        path: logoPath,
        cid: "cura-sync-logo",
    };
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

    const isConfirmed = input.status === "CONFIRMED";

    const subject = isConfirmed
        ? "Your appointment has been confirmed"
        : "Your appointment has been cancelled";

    const text = isConfirmed
        ? `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been confirmed. Please arrive 10 minutes early.`
        : `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been cancelled. Please contact the facility to reschedule.`;

    const accentColor = isConfirmed ? "#2563eb" : "#dc2626";
    const accentSoft = isConfirmed ? "#eff6ff" : "#fef2f2";
    const accentBorder = isConfirmed ? "#bfdbfe" : "#fecaca";
    const statusLabel = isConfirmed ? "Appointment Confirmed" : "Appointment Cancelled";
    const statusPill = isConfirmed ? "Confirmed" : "Cancelled";
    const bodyNote = isConfirmed
        ? "Please arrive <strong>10 minutes early</strong> and bring any relevant documents or previous test results."
        : "To reschedule, please contact the facility directly or book through the CuraSync app.";

    const siteUrl = getPublicSiteUrl();
    const logoAttachment = getLogoAttachment();
    const logoSrc = logoAttachment
        ? "cid:cura-sync-logo"
        : siteUrl
          ? `${siteUrl}/icons/android-chrome-192x192.png`
          : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px 56px;background:#f5f7fb;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo row -->
          <tr>
            <td style="padding-bottom:22px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="vertical-align:middle;">
                    ${
                        logoSrc
                            ? `<img src="${escapeHtml(logoSrc)}" width="40" height="40" alt="CuraSync" style="display:block;border:0;border-radius:10px;outline:none;text-decoration:none;" />`
                            : `<span style="display:block;width:40px;height:40px;border-radius:10px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:800;line-height:40px;text-align:center;">CS</span>`
                    }
                  </td>
                  <td style="vertical-align:middle;padding-left:10px;text-align:left;">
                    <div style="font-size:16px;font-weight:800;color:#0f172a;letter-spacing:-0.3px;line-height:1;">CuraSync</div>
                    <div style="margin-top:4px;font-size:11px;font-weight:600;color:#64748b;letter-spacing:0.04em;text-transform:uppercase;">Healthcare notification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">

              <!-- Status accent line -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:5px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- Headline -->
                <tr>
                  <td style="padding:34px 38px 0;">
                    <span style="display:inline-block;border:1px solid ${accentBorder};border-radius:999px;background:${accentSoft};padding:6px 11px;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${accentColor};">${escapeHtml(statusPill)}</span>
                    <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.18;font-weight:800;letter-spacing:-0.7px;color:#0f172a;">${escapeHtml(statusLabel)}</h1>
                    <p style="margin:0;font-size:15px;color:#475569;line-height:1.65;">Hi <strong style="color:#0f172a;">${escapeHtml(patientName)}</strong>, this is an automated update for your clinic appointment.</p>
                  </td>
                </tr>

                <!-- Details block -->
                <tr>
                  <td style="padding:26px 38px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
                      <tr>
                        <td style="padding:22px 24px;">

                          <!-- Facility -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:15px;">
                            <tr>
                              <td style="width:82px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:3px;vertical-align:top;">Clinic</td>
                              <td style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;">${escapeHtml(facilityName)}</td>
                            </tr>
                          </table>

                          <!-- Date -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:15px;">
                            <tr>
                              <td style="width:82px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:3px;vertical-align:top;">Date</td>
                              <td style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;">${escapeHtml(appointmentDate)}</td>
                            </tr>
                          </table>

                          <!-- Time -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:82px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:3px;vertical-align:top;">Time</td>
                              <td style="font-size:15px;font-weight:700;color:#0f172a;line-height:1.35;">${escapeHtml(appointmentTime)}</td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Note -->
                <tr>
                  <td style="padding:22px 38px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid ${accentColor};background:${accentSoft};border-radius:12px;">
                      <tr>
                        <td style="padding:15px 17px;">
                          <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">${bodyNote}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider + footer -->
                <tr>
                  <td style="padding:30px 38px 32px;">
                    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.65;text-align:center;">
                      Automated notification. Please do not reply to this email.<br />
                      CuraSync &middot; Integrated Healthcare Platform
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: config.from,
        to: input.to,
        subject,
        text,
        html,
        attachments: logoAttachment ? [logoAttachment] : undefined,
    });
}
