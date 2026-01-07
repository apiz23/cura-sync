"use client";

import React, { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus, User } from "lucide-react";

interface UserOption {
    id: string;
    email: string;
    full_name: string | null;
}

export default function AddPatientSheet({
    onCreated,
    children,
}: {
    onCreated: () => void;
    children: React.ReactNode;
}) {
    const [mode, setMode] = useState<"register" | "select">("register");

    // cura_profiles
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    // cura_patient_profiles
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodType, setBloodType] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [allergies, setAllergies] = useState("");
    const [chronic, setChronic] = useState("");
    const [emergency, setEmergency] = useState("");

    // select existing
    const [users, setUsers] = useState<UserOption[]>([]);
    const [selectedUser, setSelectedUser] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mode === "select") {
            fetch("/api/patients/selectable")
                .then((res) => res.json())
                .then(setUsers);
        }
    }, [mode]);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const payload =
                mode === "register"
                    ? {
                          type: "register",
                          profile: {
                              full_name: name,
                              email,
                              phone_number: phone,
                          },
                          patient_profile: {
                              date_of_birth: dob || null,
                              gender,
                              blood_type: bloodType,
                              height_cm: height ? Number(height) : null,
                              weight_kg: weight ? Number(weight) : null,
                              allergies,
                              chronic_conditions: chronic,
                              emergency_contact: emergency,
                          },
                      }
                    : {
                          type: "select",
                          profile_id: selectedUser,
                          patient_profile: {
                              date_of_birth: dob || null,
                              gender,
                              blood_type: bloodType,
                              height_cm: height ? Number(height) : null,
                              weight_kg: weight ? Number(weight) : null,
                              allergies,
                              chronic_conditions: chronic,
                              emergency_contact: emergency,
                          },
                      };

            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error();

            onCreated();
        } catch {
            alert("Failed to add patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl font-bold serif">
                        Add Patient
                    </SheetTitle>
                </SheetHeader>

                {/* MODE SWITCH */}
                <div className="flex gap-2 mb-4">
                    <Button
                        variant={mode === "register" ? "default" : "outline"}
                        onClick={() => setMode("register")}
                        className="flex-1"
                    >
                        <UserPlus size={16} />
                        Register New
                    </Button>
                    <Button
                        variant={mode === "select" ? "default" : "outline"}
                        onClick={() => setMode("select")}
                        className="flex-1"
                    >
                        <User size={16} />
                        Select Existing
                    </Button>
                </div>

                {/* REGISTER / SELECT */}
                {mode === "register" && (
                    <div className="space-y-3">
                        <input
                            className="w-full p-3 border rounded-lg"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="w-full p-3 border rounded-lg"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="w-full p-3 border rounded-lg"
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                )}

                {mode === "select" && (
                    <select
                        className="w-full p-3 border rounded-lg"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    >
                        <option value="">Select user</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name || "Unnamed"} – {u.email}
                            </option>
                        ))}
                    </select>
                )}

                {/* MEDICAL INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                    <input
                        type="date"
                        className="p-3 border rounded-lg"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                    />
                    <input
                        className="p-3 border rounded-lg"
                        placeholder="Gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    />
                    <input
                        className="p-3 border rounded-lg"
                        placeholder="Blood Type"
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                    />
                    <input
                        className="p-3 border rounded-lg"
                        placeholder="Height (cm)"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />
                    <input
                        className="p-3 border rounded-lg"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />
                </div>

                <textarea
                    className="w-full p-3 border rounded-lg mt-3"
                    placeholder="Allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                />
                <textarea
                    className="w-full p-3 border rounded-lg mt-3"
                    placeholder="Chronic Conditions"
                    value={chronic}
                    onChange={(e) => setChronic(e.target.value)}
                />
                <input
                    className="w-full p-3 border rounded-lg mt-3"
                    placeholder="Emergency Contact"
                    value={emergency}
                    onChange={(e) => setEmergency(e.target.value)}
                />

                <Button
                    disabled={loading}
                    className="w-full mt-6"
                    onClick={handleSubmit}
                >
                    {loading ? "Processing..." : "Add Patient"}
                </Button>
            </SheetContent>
        </Sheet>
    );
}
