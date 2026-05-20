import supabaseAdmin from "@/lib/supabase-admin";

type MedicationRow = {
    id: string;
    prescribed_by?: string | null;
    [key: string]: unknown;
};

type StaffProfileRow = {
    id: string;
    full_name: string | null;
    facility_id: string | null;
};

type FacilityRow = {
    id: string;
    name: string | null;
};

export type PresentedMedication<T extends MedicationRow = MedicationRow> = T & {
    prescribed_by_name: string | null;
    prescribed_by_facility_name: string | null;
    prescribed_by_display: string | null;
};

export async function presentMedications<T extends MedicationRow>(
    medications: T[]
): Promise<PresentedMedication<T>[]> {
    if (!medications.length) {
        return [];
    }

    const prescriberIds = Array.from(
        new Set(
            medications
                .map((medication) => medication.prescribed_by)
                .filter(
                    (value): value is string =>
                        Boolean(value) && value !== "self"
                )
        )
    );

    const staffById = new Map<string, StaffProfileRow>();
    const facilityById = new Map<string, FacilityRow>();

    if (prescriberIds.length) {
        const { data: staffRows, error: staffError } = await supabaseAdmin
            .from("cura_staff_profiles")
            .select("id, full_name, facility_id")
            .in("id", prescriberIds);

        if (!staffError) {
            for (const row of (staffRows ?? []) as StaffProfileRow[]) {
                staffById.set(row.id, row);
            }

            const facilityIds = Array.from(
                new Set(
                    (staffRows ?? [])
                        .map((row) => row.facility_id)
                        .filter((value): value is string => Boolean(value))
                )
            );

            if (facilityIds.length) {
                const { data: facilityRows, error: facilityError } = await supabaseAdmin
                    .from("cura_facilities")
                    .select("id, name")
                    .in("id", facilityIds);

                if (!facilityError) {
                    for (const row of (facilityRows ?? []) as FacilityRow[]) {
                        facilityById.set(row.id, row);
                    }
                }
            }
        }
    }

    return medications.map((medication) => {
        const prescribedBy = medication.prescribed_by ?? null;

        if (!prescribedBy) {
            return {
                ...medication,
                prescribed_by_name: null,
                prescribed_by_facility_name: null,
                prescribed_by_display: null,
            };
        }

        if (prescribedBy === "self") {
            return {
                ...medication,
                prescribed_by_name: "Self",
                prescribed_by_facility_name: null,
                prescribed_by_display: "Self",
            };
        }

        const staff = staffById.get(prescribedBy);
        const facility =
            staff?.facility_id ? facilityById.get(staff.facility_id) : null;
        const name = staff?.full_name?.trim() || null;
        const facilityName = facility?.name?.trim() || null;

        return {
            ...medication,
            prescribed_by_name: name,
            prescribed_by_facility_name: facilityName,
            prescribed_by_display:
                name && facilityName ? `${name} · ${facilityName}` :
                name ? name :
                facilityName ? facilityName :
                null,
        };
    });
}
