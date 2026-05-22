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

    const isConfirmed = input.status === "CONFIRMED";

    const subject = isConfirmed
        ? "Your appointment has been confirmed"
        : "Your appointment has been cancelled";

    const text = isConfirmed
        ? `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been confirmed. Please arrive 10 minutes early.`
        : `Hi ${patientName}, your appointment at ${facilityName} on ${appointmentDate} at ${appointmentTime} has been cancelled. Please contact the facility to reschedule.`;

    const accentColor = isConfirmed ? "#10b981" : "#e53e3e";
    const statusLabel = isConfirmed ? "Appointment Confirmed" : "Appointment Cancelled";
    const bodyNote = isConfirmed
        ? "Please arrive <strong>10 minutes early</strong> and bring any relevant documents or previous test results."
        : "To reschedule, please contact the facility directly or book through the CuraSync app.";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const logoUrl = siteUrl ? `${siteUrl}/icons/android-chrome-192x192.png` : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px 64px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">

          <!-- Logo row -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" width="32" height="32" alt="" style="display:inline-block;vertical-align:middle;border-radius:7px;" />` : ""}
              <span style="display:inline-block;vertical-align:middle;margin-left:8px;font-size:15px;font-weight:700;color:#111;letter-spacing:-0.3px;">CuraSync</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#fff;border-radius:10px;overflow:hidden;">

              <!-- Status accent line -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="height:3px;background:${accentColor};font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Headline -->
                <tr>
                  <td style="padding:32px 36px 0;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:${accentColor};">${escapeHtml(statusLabel)}</p>
                    <p style="margin:0;font-size:15px;color:#333;line-height:1.6;">Hi <strong>${escapeHtml(patientName)}</strong>,</p>
                  </td>
                </tr>

                <!-- Details block -->
                <tr>
                  <td style="padding:24px 36px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border-radius:7px;">
                      <tr>
                        <td style="padding:20px 22px;">

                          <!-- Facility -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:13px;">
                            <tr>
                              <td style="width:64px;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.06em;padding-top:2px;vertical-align:top;">Clinic</td>
                              <td style="font-size:14px;font-weight:600;color:#111;">${escapeHtml(facilityName)}</td>
                            </tr>
                          </table>

                          <!-- Date -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:13px;">
                            <tr>
                              <td style="width:64px;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.06em;padding-top:2px;vertical-align:top;">Date</td>
                              <td style="font-size:14px;font-weight:600;color:#111;">${escapeHtml(appointmentDate)}</td>
                            </tr>
                          </table>

                          <!-- Time -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:64px;font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.06em;padding-top:2px;vertical-align:top;">Time</td>
                              <td style="font-size:14px;font-weight:600;color:#111;">${escapeHtml(appointmentTime)}</td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Note -->
                <tr>
                  <td style="padding:20px 36px 0;">
                    <p style="margin:0;font-size:13px;color:#777;line-height:1.7;">${bodyNote}</p>
                  </td>
                </tr>

                <!-- Divider + footer -->
                <tr>
                  <td style="padding:28px 36px 28px;">
                    <hr style="border:none;border-top:1px solid #ebebeb;margin:0 0 20px;" />
                    <p style="margin:0;font-size:11px;color:#bbb;line-height:1.6;text-align:center;">
                      Automated notification &middot; Please do not reply<br />
                      CuraSync &mdash; Integrated Healthcare Platform
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
    });
}
