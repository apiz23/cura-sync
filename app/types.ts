export interface Facility {
    id: string;
    name: string;
    type?: string;
    specialty?: string;
    address: string;
    phone?: string;
    rating?: number;
    wait_time?: number;
    slots?: string[];
    coordinates?: [number, number];
}

export interface Appointment {
    id: string;
    profile_id: string | null;
    facility_id: string | null;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    reason_for_visit: string | null;
    patient_name: string;
    patient_avatar?: string | null;
    facility_name: string;
}

type AvailabilitySlot = {
    day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday";
    start_time: string;
    end_time: string;
};

export type Staff = {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "doctor" | "nurse" | null;
    specialization: string | null;
    license_number: string | null;
    facility_id: string | null;
    years_of_experience: number | null;
    availability: AvailabilitySlot | null;
    created_at: string;
};

export type SessionStaff = {
    id: string;
    email: string;
    role: "admin" | "doctor" | "nurse";
    facility_id: string;
};
