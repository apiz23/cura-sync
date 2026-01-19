"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { AuthUser } from "@/app/types";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
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

            if (!session?.email) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("cura_staff_profiles")
                .select("*")
                .eq("email", session.email)
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
                    availability: data.availability,
                    created_at: data.created_at,
                });
            }

            setLoading(false);
        }

        loadUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
