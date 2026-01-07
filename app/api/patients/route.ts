import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from("cura_profiles")
        .select(
            `
            id,
            email,
            full_name,
            role,
            avatar_url,
            phone_number,
            created_at,
            patient_profiles (
                date_of_birth,
                gender,
                blood_type
            )
        `
        )
        .eq("role", "patient")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch patients" },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

export async function POST(req: Request) {
    const body = await req.json();

    const { email, full_name, phone_number } = body;

    const { data, error } = await supabase.from("cura_profiles").insert({
        email,
        full_name,
        phone_number,
        role: "patient",
    });

    if (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to create patient" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
}
