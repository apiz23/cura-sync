import {
    LayoutDashboard,
    BarChart3,
    Users,
    FileCheck,
    Pill,
    ClipboardList,
    UserPlus,
    Shield,
    UserCircle,
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
        {
          title: "Analytics & Reports",
          url: "/admin/analytics",
          icon: BarChart3,
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
          title: "Record Verification",
          url: "/admin/records/verify",
          icon: FileCheck,
        },
        {
          title: "Prescription Queue",
          url: "/admin/prescriptions",
          icon: Pill,
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
          title: "Admin Profile",
          url: "/admin/profile",
          icon: UserCircle,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];
  