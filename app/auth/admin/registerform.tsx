"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldDescription,
} from "@/components/ui/field";
import { toast } from "sonner";

export default function RegisterForm() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("doctor");
    const [specialization, setSpecialization] = useState("");
    const [facilityId, setFacilityId] = useState("");

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/staff/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullName,
                email,
                password,
                role,
                specialization,
                facilityId,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Staff registered successfully!");
            setFullName("");
            setEmail("");
            setPassword("");
            setSpecialization("");
            setFacilityId("");
        } else {
            toast.error(data.error || "Registration failed");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-xl font-bold mb-4">Register Staff</h1>

            <form onSubmit={handleRegister}>
                <FieldGroup>
                    <Field>
                        <FieldLabel>Full Name</FieldLabel>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Role</FieldLabel>
                        <select
                            className="border rounded p-2 w-full"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="admin">Admin</option>
                        </select>
                    </Field>

                    <Field>
                        <FieldLabel>Specialization</FieldLabel>
                        <Input
                            placeholder="Optional"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Facility ID</FieldLabel>
                        <Input
                            placeholder="UUID of facility"
                            value={facilityId}
                            onChange={(e) => setFacilityId(e.target.value)}
                            required
                        />
                    </Field>

                    <Field>
                        <Button type="submit">Register Staff</Button>
                    </Field>
                </FieldGroup>
            </form>

            <FieldDescription className="mt-4">
                Register new doctor, nurse, or admin for a facility.
            </FieldDescription>
        </div>
    );
}
