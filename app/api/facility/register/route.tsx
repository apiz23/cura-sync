"use server";

import { NextResponse } from "next/server";
import supabase from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { facility, admin } = body;

        if (!facility || !admin) {
            return NextResponse.json(
                { error: "Facility info and Admin info are mandatory." },
                { status: 400 }
            );
        }

        const { name, type, specialty, phone, address, latitude, longitude } =
            facility;

        const {
            name: adminName,
            email: adminEmail,
            password: adminPassword,
        } = admin;

        if (!name || !address || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        const { data: facilityData, error: facilityError } = await supabase
            .from("cura_facilities")
            .insert({
                name,
                type: type ?? null,
                specialty: specialty ?? null,
                phone: phone ?? null,
                address,
                latitude: latitude ?? null,
                longitude: longitude ?? null,
                is_active: false,
            })
            .select()
            .single();

        if (facilityError) {
            console.error("Facility insert error:", facilityError);
            return NextResponse.json(
                { error: facilityError.message },
                { status: 500 }
            );
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const { error: adminError } = await supabase
            .from("cura_staff_profiles")
            .insert({
                full_name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                specialization: "Facility Manager",
                facility_id: facilityData.id,
            });

        if (adminError) {
            console.error("Admin insert error:", adminError);
            return NextResponse.json(
                { error: "Facility created but admin creation failed." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                facilityId: facilityData.id,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("API Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
