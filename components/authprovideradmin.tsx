"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { Staff } from "@/app/types";

interface AuthContextType {
    staff: Staff | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthAdminProvider({ children }: { children: React.ReactNode }) {
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const raw = sessionStorage.getItem("cura-auth");

            if (!raw) {
                setLoading(false);
                return;
            }

            let session;
            try {
                session = JSON.parse(raw);
            } catch {
                sessionStorage.removeItem("cura-auth");
                setLoading(false);
                return;
            }

            const { email } = session;
            if (!email) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("cura_staff_profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (!error && data) {
                setStaff({
                    id: data.id,
                    full_name: data.full_name,
                    email: data.email,
                    role: data.role,
                    specialization: data.specialization,
                    license_number: data.license_number,
                    facility_id: data.facility_id,
                    years_of_experience: data.years_of_experience,
                    availability: data.availability,
                    created_at: data.created_at,
                });
            }

            setLoading(false);
        }

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ staff, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthAdminProvider");
    }
    return context;
}
