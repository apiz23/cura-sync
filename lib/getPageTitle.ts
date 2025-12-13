export function getPageTitle(pathname: string): string {
    const map: Record<string, string> = {
        // Admin Paths
        "/admin/dashboard": "Dashboard Home",
        "/analytics": "Analytics & Reports",
        "/admin/patients": "Patient Management",
        "/records/verify": "Record Verification",
        "/prescriptions": "Prescription Queue",
        "/admin/appointments": "Appointments",
        "/admin/add-staff": "Add Staff",
        "/blockchain-status": "Blockchain Status",
        "/admin/profile": "Staff Accounts",
        "/settings": "System Settings",
        "/admin/health-center": "Edit Health Center",

        // User Paths
        "/user/dashboard": "Dashboard",
        "/user/symptom-check": "AI Symptom Check",
        "/user/appointments": "Appointments",
        "/user/doctors": "Find Doctors",
        "/user/medications": "Medication Manager",
        "/user/records": "Medical History",
        "/user/blockchain": "Blockchain Security",
        "/user/profile": "Profile Settings",
        "/user/settings": "App Settings",
        "/user/security": "Security & Privacy",
    };

    return map[pathname];
}
