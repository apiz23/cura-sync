import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const allowed = {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        schedule: body.schedule,
        start_date: body.start_date,
        end_date: body.end_date,
        notes: body.notes,
        prescribed_by: body.prescribed_by,
        status: body.status,
        updated_at: body.updated_at,
    };

    const { data, error } = await supabase
        .from("cura_medications")
        .update(allowed)
        .eq("id", id)
        .eq("profile_id", userId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
        .from("cura_medications")
        .delete()
        .eq("id", id) // Fixed: use awaited id instead of params.id
        .eq("profile_id", userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
        .from("cura_medications")
        .select("*")
        .eq("id", id)
        .eq("profile_id", userId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("cura_medication_logs").insert({
        medication_id: id,
        profile_id: userId,
        status: "TAKEN",
        taken_at: new Date().toISOString(),
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
