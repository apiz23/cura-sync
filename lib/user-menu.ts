import {
    LayoutDashboard,
    Brain,
    FileText,
    CalendarDays,
    ShieldCheck,
    Settings,
    User,
    Stethoscope,
    Pill,
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
        ],
    },
    {
        title: "AI & Consultation",
        items: [
            {
                title: "AI Symptom Check",
                url: "/user/symptom-check",
                icon: Brain,
            },
            {
                title: "Appointments",
                url: "/user/appointments",
                icon: CalendarDays,
            },
            {
                title: "Find Doctors",
                url: "/user/doctors",
                icon: Stethoscope,
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
                title: "App Settings",
                url: "/user/settings",
                icon: Settings,
            },
        ],
    },
];
