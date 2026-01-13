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

export type Medication = {
    id: string;
    profile_id: string;
    name: string;
    dosage: string;
    frequency: string;
    schedule: string;
    status: "ACTIVE" | "COMPLETED" | "STOPPED";
    start_date: string;
    end_date?: string | null;
    notes?: string | null;
    prescribed_by?: string | null;
    created_at?: string;
    updated_at?: string;
};

export type FacilityEdit = {
    id: string;
    name: string | null;
    type: string | null;
    specialty: string | null;
    description: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    phone: string | null;
    email: string | null;
    opening_hours: string | null;
    capacity: number | null;
    services: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
};

export interface StaffProfile {
    id: string;
    full_name: string;
    email: string;
    role: "doctor" | "nurse" | "admin";
    specialization: string | null;
    license_number: string | null;
    facility_id: string | null;
    years_of_experience: number | null;
    availability: Availability | null;
    created_at: string;
}

interface Availability {
    available?: boolean;
    schedule?: string;
    notes?: string;
    updated_at?: string;
}
