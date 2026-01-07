import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase";

interface Availability {
    available?: boolean;
    notes?: string;
    updated_at?: string;
}

interface UpdateStaffBody {
    full_name?: string;
    role?: "doctor" | "nurse" | "admin";
    specialization?: string;
    license_number?: string;
    facility_id?: string;
    years_of_experience?: number;
    availability?: Availability;
    email?: string;
    password?: string;
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const { data, error } = await supabase
            .from("cura_staff_profiles")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("Get error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = (await req.json()) as UpdateStaffBody;

        const updateData: Partial<UpdateStaffBody> = { ...body };

        // Remove undefined values
        (Object.keys(updateData) as (keyof UpdateStaffBody)[]).forEach(
            (key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            }
        );

        const { data, error } = await supabase
            .from("cura_staff_profiles")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("Update error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const { error } = await supabase
            .from("cura_staff_profiles")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, deleted: true });
    } catch (err: unknown) {
        console.error("Delete error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = (await req.json()) as Partial<UpdateStaffBody>;

        const { data, error } = await supabase
            .from("cura_staff_profiles")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("Patch error:", err);
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
