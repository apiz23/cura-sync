import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function POST() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = (user.publicMetadata?.role as string) || "patient";
        const fullName = `${user.firstName ?? ""} ${
            user.lastName ?? ""
        }`.trim();
        const email = user.emailAddresses[0]?.emailAddress;

        const userData = {
            id: user.id,
            email: email,
            full_name: fullName,
            avatar_url: user.imageUrl,
            role: userRole.toLowerCase(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("cura_profiles")
            .upsert(userData, { onConflict: "id" })
            .select();

        if (error) {
            console.error("Supabase Sync Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Internal Sync Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
