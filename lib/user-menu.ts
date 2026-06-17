import {
    LayoutDashboard,
    Brain,
    Bell,
    FileText,
    CalendarDays,
    ShieldCheck,
    User,
    Pill,
    Activity,
    Lock,
    Settings,
    Video,
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
            {
                title: "Telehealth",
                url: "/user/telehealth",
                icon: Video,
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
            {
                title: "Blockchain Security",
                url: "/user/blockchain",
                icon: ShieldCheck,
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
