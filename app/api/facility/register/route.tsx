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

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const { data, error } = await supabase.rpc(
            "cura_register_facility_with_admin",
            {
                p_facility_name: name,
                p_facility_type: type ?? "",
                p_facility_specialty: specialty ?? "",
                p_facility_phone: phone ?? "",
                p_facility_address: address,
                p_facility_latitude: latitude ?? "",
                p_facility_longitude: longitude ?? "",
                p_admin_name: adminName,
                p_admin_email: adminEmail,
                p_admin_password_hash: hashedPassword,
            }
        );

        if (error) {
            console.error("Facility register RPC error:", error);
            return NextResponse.json(
                {
                    error:
                        error.message ||
                        "Registration failed (missing RPC function?)",
                },
                { status: 500 }
            );
        }

        const facilityId =
            Array.isArray(data) && data.length > 0
                ? (data[0] as { facility_id: string }).facility_id
                : null;

        if (!facilityId) {
            return NextResponse.json(
                { error: "Registration failed" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                facilityId,
                facility: { name },
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
