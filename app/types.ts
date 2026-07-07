export interface Facility {
	id: string;
	name: string;
	type: string | null;
	specialty: string | null;
	address: string;
	is_active: boolean;
	created_at: string;
	latitude: string | null;
	longitude: string | null;
}

export interface FacilitySchedule {
	id: string;
	facility_id: string;
	day_of_week: number;
	start_time: string;
	end_time: string;
	slot_duration_minutes: number;
	break_start: string | null;
	break_end: string | null;
}

export interface Appointment {
	id: string;
	profile_id: string | null;
	facility_id: string | null;
	appointment_date: string;
	start_time: string;
	end_time: string;
	status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED" | "COMPLETED";
	reason_for_visit: string | null;
	patient_name: string;
	patient_avatar?: string | null;
	facility_name: string;
}

export type StaffRole = "doctor" | "staff" | "admin";
export type FacilityPlan = "basic" | "clinic" | "enterprise";
export type DayOfWeek =
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday"
	| "sunday";

export type WeeklyAvailability = Record<DayOfWeek, string[]>;

export interface Staff {
	id: string;
	full_name: string;
	email: string;
	role: StaffRole | null;
	specialization: string | null;
	license_number: string | null;
	facility_id: string | null;
	years_of_experience: number | null;
	availability: WeeklyAvailability | null;
	created_at: string;
}

export type SessionStaff = {
	id: string;
	email: string;
	role: StaffRole;
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
	prescribed_by_name?: string | null;
	prescribed_by_facility_name?: string | null;
	prescribed_by_display?: string | null;
	created_at: string;
	updated_at: string;
	patient_name?: string | null;
	is_own?: boolean;
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
	plan: FacilityPlan;
	created_at: string;
	updated_at: string | null;
};

export interface StaffProfile {
	id: string;
	full_name: string;
	email: string;
	role: StaffRole;
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

export interface Patient {
	id: string;
	email: string;
	full_name?: string;
	role?: string;
	avatar_url?: string;
	phone_number?: string;
	created_at: string;
	status?: "active" | "inactive" | "suspended";
}

export interface StaffAccountSettings {
	email_notifications: boolean;
	sms_notifications: boolean;
	schedule_notifications: boolean;
	security_alerts: boolean;
	marketing_emails: boolean;
	session_version: number;
	last_login_at: string | null;
	last_seen_at: string | null;
	password_changed_at: string | null;
	created_at: string;
	updated_at: string;
}

export type UserRole = StaffRole;

export interface AuthUser {
	id: string;
	full_name: string;
	email: string;
	role: UserRole;
	specialization?: string | null;
	license_number?: string | null;
	facility_id?: string | null;
	facility_name?: string | null;
	years_of_experience?: number | null;
	availability?: WeeklyAvailability | null;
	created_at: string;
	account_settings?: StaffAccountSettings | null;
}

export interface AnalysisResult {
	possible_disease: string;
	confidence_level: string;
	urgency: "emergency" | "high" | "medium" | "low" | "unknown";
	suggested_action: string;
	normalized_symptoms?: string[];
	iot_flags?: string[];
	disclaimer?: string;
	timestamp?: string;
	source?: string;
}
