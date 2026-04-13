import type { StaffRole } from "@/app/types";

const STAFF_ROLE_ALIASES: Record<string, StaffRole> = {
	admin: "admin",
	doctor: "doctor",
	nurse: "staff",
	staff: "staff",
	user: "staff",
};

export function normalizeStaffRole(role: string | null | undefined): StaffRole {
	const normalized = String(role ?? "").trim().toLowerCase();
	return STAFF_ROLE_ALIASES[normalized] ?? "staff";
}

export function isStaffRole(role: string | null | undefined): role is StaffRole {
	return ["admin", "doctor", "staff"].includes(
		normalizeStaffRole(role)
	);
}

export function getStaffRoleLabel(role: string | null | undefined): string {
	const normalized = normalizeStaffRole(role);

	switch (normalized) {
		case "admin":
			return "Administrator";
		case "doctor":
			return "Doctor";
		default:
			return "Staff";
	}
}
