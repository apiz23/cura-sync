import {
    LayoutDashboard,
    Brain,
    Bell,
    FileText,
    CalendarDays,
    User,
    Pill,
    Activity,
    Lock,
    Settings,
    Users,
} from "lucide-react";

export const userMenu = [
    {
        title: "Health Overview",
        items: [
            {
                title: "Dashboard",
                url: "/user/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "Health Tracking",
                url: "/user/health",
                icon: Activity,
            },
        ],
    },
    {
        title: "AI & Consultation",
        items: [
            {
                title: "AI Symptom Check",
                url: "/user/symptom-analyzer",
                icon: Brain,
            },
            {
                title: "Appointments",
                url: "/user/appointments",
                icon: CalendarDays,
            },
            {
                title: "Medication Manager",
                url: "/user/medications",
                icon: Pill,
            },
        ],
    },
    {
        title: "Medical Records",
        items: [
            {
                title: "Medical History",
                url: "/user/records",
                icon: FileText,
            },
        ],
    },
    {
        title: "Care Network",
        items: [
            {
                title: "Caregiver",
                url: "/user/caregiver",
                icon: Users,
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                title: "Profile Settings",
                url: "/user/profile",
                icon: User,
            },
            {
                title: "Notifications",
                url: "/user/notifications",
                icon: Bell,
            },
            {
                title: "Preferences",
                url: "/user/settings",
                icon: Settings,
            },
            {
                title: "Security",
                url: "/user/security",
                icon: Lock,
            },
        ],
    },
];
