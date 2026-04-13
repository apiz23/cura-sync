"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/components/authprovideradmin";

interface UserOption {
    id: string;
    email: string;
    full_name: string | null;
    phone_number?: string;
    is_registered?: boolean;
}

export default function AddPatientSheet({
    onCreated,
    children,
}: {
    onCreated: () => void;
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserOption[]>([]);
    const [filtered, setFiltered] = useState<UserOption[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const facilityId = user?.facility_id ?? null;

    useEffect(() => {
        fetch("/api/user")
            .then((r) => r.json())
            .then(setUsers)
            .catch(() => toast.error("Failed to load users"));
    }, []);

    useEffect(() => {
        setFiltered(
            users.filter(
                (u) =>
                    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                    u.email.toLowerCase().includes(search.toLowerCase())
            )
        );
    }, [search, users]);

    async function registerPatient() {
        if (!selected || !facilityId) {
            throw new Error("Missing required data");
        }

        const res = await fetch("/api/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                profile_id: selected,
                facility_id: facilityId,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data?.error || "Failed to register patient");
        }

        return data;
    }

    function handleSubmit() {
        setLoading(true);

        toast.promise(registerPatient(), {
            loading: "Registering patient...",
            success: () => {
                onCreated();
                setSelected(null);
                setSearch("");
                return "Patient registered successfully";
            },
            error: (err) => err.message,
            finally: () => setLoading(false),
        });
    }

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="sm:max-w-lg p-4">
                <SheetHeader>
                    <SheetTitle>Add Patient</SheetTitle>
                </SheetHeader>

                <div className="my-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filtered.map((u) => (
                        <Card
                            key={u.id}
                            className={`cursor-pointer transition ${
                                u.is_registered
                                    ? "opacity-50 cursor-not-allowed"
                                    : selected === u.id
                                    ? "border-primary"
                                    : ""
                            }`}
                            onClick={() => {
                                if (!u.is_registered) setSelected(u.id);
                            }}
                        >
                            <CardContent className="p-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">
                                        {u.full_name || "Unnamed User"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {u.email}
                                    </p>
                                </div>

                                {u.is_registered ? (
                                    <Badge variant="secondary">
                                        Registered
                                    </Badge>
                                ) : selected === u.id ? (
                                    <Check className="text-primary" />
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Button
                    className="w-full mt-6"
                    disabled={!selected || loading}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Registering...
                        </>
                    ) : (
                        "Register Patient"
                    )}
                </Button>
            </SheetContent>
        </Sheet>
    );
}
