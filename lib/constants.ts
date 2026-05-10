export const APPOINTMENT_STATUS = {
	PENDING: "PENDING",
	CONFIRMED: "CONFIRMED",
	CHECKED_IN: "CHECKED_IN",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const MEDICATION_STATUS = {
	ACTIVE: "ACTIVE",
	COMPLETED: "COMPLETED",
	STOPPED: "STOPPED",
} as const;

export type MedicationStatus = (typeof MEDICATION_STATUS)[keyof typeof MEDICATION_STATUS];

export const STAFF_ROLE = {
	ADMIN: "admin",
	STAFF: "staff",
	DOCTOR: "doctor",
} as const;

export type StaffRole = (typeof STAFF_ROLE)[keyof typeof STAFF_ROLE];
