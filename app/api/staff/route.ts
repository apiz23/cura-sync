import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcrypt";

export async function GET() {
    const { data, error } = await supabase
        .from("cura_staff_profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error)
        return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ staff: data });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fullName, email, password, role, specialization, facilityId } =
            body;

        if (!fullName || !email || !role || !facilityId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let hashedPassword: string | null = null;
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const { data, error } = await supabase
            .from("cura_staff_profiles")
            .insert({
                full_name: fullName,
                email,
                password: hashedPassword,
                role,
                specialization: specialization || null,
                facility_id: facilityId,
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Staff account created", data });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
