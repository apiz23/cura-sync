import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ContactPayload = {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
};

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure = String(process.env.SMTP_SECURE ?? "true") === "true";
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !user || !pass) return null;

    return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } =
            (await req.json()) as ContactPayload;

        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const transporter = getTransporter();
        if (!transporter) {
            return NextResponse.json({ error: "Email service is not configured" }, { status: 500 });
        }

        const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER!;

        await transporter.sendMail({
            from: `CuraSync <${from}>`,
            to: "piz230601@gmail.com",
            replyTo: email.trim(),
            subject: `[CuraSync Contact] ${subject.trim()}`,
            text: [
                `Name: ${name.trim()}`,
                `Email: ${email.trim()}`,
                `Subject: ${subject.trim()}`,
                "",
                "Message:",
                message.trim(),
            ].join("\n"),
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px 56px;background:#f5f7fb;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td style="padding-bottom:22px;text-align:center;">
            <span style="font-size:16px;font-weight:800;color:#0f172a;">CuraSync</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,0.08);">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:5px;background:#0085C8;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:34px 38px 0;">
                  <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0f172a;">New Contact Form Message</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 38px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;">
                    <tr>
                      <td style="padding:22px 24px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:80px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:2px;vertical-align:top;">Name</td>
                            <td style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(name.trim())}</td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                          <tr>
                            <td style="width:80px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:2px;vertical-align:top;">Email</td>
                            <td style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(email.trim())}</td>
                          </tr>
                        </table>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width:80px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;padding-top:2px;vertical-align:top;">Subject</td>
                            <td style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(subject.trim())}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 38px 0;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #0085C8;background:#eff6ff;border-radius:12px;">
                    <tr>
                      <td style="padding:15px 17px;">
                        <p style="margin:0 0 6px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Message</p>
                        <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">${escapeHtml(message.trim()).replace(/\n/g, "<br/>")}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 38px 32px;">
                  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 18px;"/>
                  <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                    Reply to this email to respond directly to ${escapeHtml(name.trim())}.<br/>
                    CuraSync &middot; Integrated Healthcare Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form send error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
