import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { fullName, email, password, role, specialization, facilityId } =
            await req.json();

        if (!fullName || !email || !password || !role || !facilityId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase.from("cura_staff_profiles").insert({
            id: uuidv4(),
            full_name: fullName,
            email,
            password: hashedPassword,
            role,
            specialization: specialization || null,
            facility_id: facilityId,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { success: true, message: "Staff registered" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
