"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "@/app/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    updateUser: (nextUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    async function loadUser() {
        try {
            const res = await fetch("/api/staff/me", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (res.status === 401) {
                setUser(null);
                router.replace("/auth/admin");
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                setUser(null);
                router.replace("/auth/admin");
                return;
            }

            setUser(data as AuthUser);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                refreshUser: loadUser,
                updateUser: setUser,
            }}
        >
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
