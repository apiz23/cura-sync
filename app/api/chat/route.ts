import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { session_id, message } = await req.json();

        // Validate input
        if (!message || !message.trim()) {
            return NextResponse.json(
                { reply: "Message cannot be empty" },
                { status: 400 }
            );
        }

        console.log("Sending to FastAPI:", { session_id, message });

        const res = await fetch(
            `${
                process.env.NEXT_PUBLIC_CURA_SYNC_AI || "http://127.0.0.1:8000"
            }/analyze`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: session_id || `session-${Date.now()}`,
                    message: message.trim(),
                }),
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error("FastAPI error:", errorText);
            throw new Error(`FastAPI returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log("Received from FastAPI:", data);

        return NextResponse.json({ reply: data.response });
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("API Route Error:", error);
        return NextResponse.json(
            { reply: `Error: ${error.message}` },
            { status: 500 }
        );
    }
}
