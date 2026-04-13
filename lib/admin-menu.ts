import {
    LayoutDashboard,
    Users,
    ClipboardList,
    UserPlus,
    Shield,
    Settings,
    Hospital,
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
            },
            {
                title: "Staff Management",
                url: "/admin/staff",
                icon: UserPlus,
            },
        ],
    },
    {
        title: "System & Security",
        roles: ["admin"],
        items: [
            {
                title: "Blockchain Status",
                url: "/admin/blockchain",
                icon: Shield,
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
