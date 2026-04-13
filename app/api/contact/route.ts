import { NextResponse } from "next/server";

type ContactPayload = {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } =
            (await req.json()) as ContactPayload;

        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.CONTACT_FROM_EMAIL;
        const toEmail = process.env.CONTACT_TO_EMAIL;

        if (!apiKey || !fromEmail || !toEmail) {
            return NextResponse.json(
                {
                    error: "Contact email service is not configured",
                },
                { status: 500 }
            );
        }

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [toEmail],
                reply_to: email.trim(),
                subject: `[CuraSync Contact] ${subject.trim()}`,
                text: [
                    `Name: ${name.trim()}`,
                    `Email: ${email.trim()}`,
                    `Subject: ${subject.trim()}`,
                    "",
                    "Message:",
                    message.trim(),
                ].join("\n"),
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #081e24;">
                        <h2>New CuraSync Contact Form Submission</h2>
                        <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
                        <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
                        <p><strong>Subject:</strong> ${escapeHtml(subject.trim())}</p>
                        <hr />
                        <p><strong>Message:</strong></p>
                        <p>${escapeHtml(message.trim()).replace(/\n/g, "<br />")}</p>
                    </div>
                `,
            }),
        });

        if (!resendResponse.ok) {
            const resendError = await resendResponse.json().catch(() => null);
            return NextResponse.json(
                {
                    error:
                        resendError?.message ||
                        resendError?.error ||
                        "Failed to send message",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact form send error:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}
