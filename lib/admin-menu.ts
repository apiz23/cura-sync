import {
    LayoutDashboard,
    Users,
    ClipboardList,
    UserPlus,
    Shield,
    Settings,
    Hospital,
    ScrollText,
} from "lucide-react";

export const adminMenu = [
    {
        title: "Platform Overview",
        roles: ["admin", "staff", "doctor"],
        items: [
            {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Management & Workflow",
        roles: ["admin", "staff", "doctor"],
        items: [
            {
                title: "Patient Management",
                url: "/admin/patients",
                icon: Users,
            },
            {
                title: "Appointments",
                url: "/admin/appointments",
                icon: ClipboardList,
                roles: ["admin", "staff"],
            },
            {
                title: "Consultations",
                url: "/admin/consultations",
                icon: ClipboardList,
                roles: ["doctor"],
            },
            {
                title: "Staff Management",
                url: "/admin/staff",
                icon: UserPlus,
                roles: ["admin"],
            },
        ],
    },
    {
        title: "System & Security",
        roles: ["admin"],
        items: [
            {
                title: "Audit Trail",
                url: "/admin/audit",
                icon: ScrollText,
            },
            {
                title: "Health Center",
                url: "/admin/health-center",
                icon: Hospital,
            },
            {
                title: "Security",
                url: "/admin/security",
                icon: Shield,
            },
            {
                title: "Preferences",
                url: "/admin/settings",
                icon: Settings,
            },
        ],
    },
];
