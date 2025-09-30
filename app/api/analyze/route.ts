import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { symptoms } = await req.json();

        if (!symptoms || !symptoms.trim()) {
            return NextResponse.json(
                { error: "Symptoms cannot be empty" },
                { status: 400 }
            );
        }

        const jamAIRes = await fetch(
            `${process.env.NEXT_PUBLIC_CURA_SYNC_AI}/analyze`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symptoms }),
            }
        );

        if (!jamAIRes.ok) {
            const errData = await jamAIRes.json();
            return NextResponse.json(
                { error: errData.detail || "Failed to analyze symptoms" },
                { status: 500 }
            );
        }

        const data = await jamAIRes.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}
