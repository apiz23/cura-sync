"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase";

interface UserData {
    id: string;
    full_name: string;
    email: string;
    role: string;
    specialization: string;
    license_number: string;
    facility_id: string;
    years_of_experience: number;
    phone_number: string;
}

interface AuthContextType {
    staff: UserData | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthAdminProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const raw = localStorage.getItem("cura-auth");

            if (!raw) {
                setLoading(false);
                return;
            }

            const session = JSON.parse(raw);
            const { email } = session;

            const { data, error } = await supabase
                .from("cura_staff_profiles")
                .select("*")
                .eq("email", email)
                .single();

            if (!error && data) {
                setUser({
                    id: data.id,
                    full_name: data.full_name,
                    email: data.email,
                    role: data.role,
                    specialization: data.specialization,
                    license_number: data.license_number,
                    facility_id: data.facility_id,
                    years_of_experience: data.years_of_experience,
                    phone_number: data.phone_number,
                });
            }

            setLoading(false);
        }

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ staff: user, loading }}>
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
