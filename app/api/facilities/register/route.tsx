"use server";

import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            name,
            type,
            specialty,
            address,
            latitude,
            longitude,
            adminName,
            adminEmail,
            adminPassword,
        } = body;

        if (!name || !address || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json(
                {
                    error: "Missing required fields: Facility info and Admin info are mandatory.",
                },
                { status: 400 }
            );
        }

        const { data: facility, error: facilityError } = await supabase
            .from("cura_facilities")
            .insert({
                name,
                type: type || null,
                specialty: specialty || null,
                address,
                latitude: latitude || null,
                longitude: longitude || null,
                is_active: false,
            })
            .select()
            .single();

        if (facilityError) {
            console.error("Supabase Facility Error:", facilityError);
            return NextResponse.json(
                { error: facilityError.message },
                { status: 500 }
            );
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminId = uuidv4();
        const { error: profileError } = await supabase
            .from("cura_staff_profiles")
            .insert({
                id: adminId,
                full_name: adminName,
                role: "admin",
                facility_id: facility.id,
                specialization: "Facility Manager",
                email: adminEmail,
                password: hashedPassword,
            });

        if (profileError) {
            console.error("Supabase Profile Error:", profileError);
            return NextResponse.json(
                { error: "Facility created but failed to assign Admin role." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, facilityId: facility.id },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error("API Error:", error);

        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
