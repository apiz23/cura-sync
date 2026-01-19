import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import supabase from "@/lib/supabase";

/* =========================
   PATCH /api/medications/[id]
   ========================= */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const allowedUpdates = {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        schedule: body.schedule,
        start_date: body.start_date,
        end_date: body.end_date,
        notes: body.notes,
        prescribed_by: body.prescribed_by,
        status: body.status,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("cura_medications")
        .update(allowedUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

/* =========================
   DELETE /api/medications/[id]
   ========================= */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
        .from("cura_medications")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
