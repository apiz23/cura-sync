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
import {
    User,
    Calendar,
    Droplets,
    Ruler,
    Scale,
    ShieldAlert,
    HeartPulse,
    Phone,
    Loader2,
    Search,
    X,
    UserCircle,
    Shield,
    Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserOption {
    id: string;
    email: string;
    full_name: string | null;
    phone_number?: string;
    role?: string;
    is_patient?: boolean;
    created_at?: string;
}

export default function AddPatientSheet({
    onCreated,
    children,
}: {
    onCreated: () => void;
    children: React.ReactNode;
}) {
    const [users, setUsers] = useState<UserOption[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedUserData, setSelectedUserData] = useState<UserOption | null>(
        null
    );

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showUserList, setShowUserList] = useState(false);

    // Patient medical information
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodType, setBloodType] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [allergies, setAllergies] = useState("");
    const [chronic, setChronic] = useState("");
    const [emergency, setEmergency] = useState("");

    // Blood type options
    const bloodTypes = [
        "A+",
        "A-",
        "B+",
        "B-",
        "O+",
        "O-",
        "AB+",
        "AB-",
        "Unknown",
    ];

    // Gender options
    const genders = ["Male", "Female", "Other", "Prefer not to say"];

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = users.filter(
            (user) =>
                user.full_name?.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone_number?.toLowerCase().includes(query)
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    // Load users when sheet opens
    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await fetch("/api/user");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (open) {
            loadUsers();
        }
    };

    // Update selected user data when selection changes
    useEffect(() => {
        if (selectedUser) {
            const user = users.find((u) => u.id === selectedUser);
            setSelectedUserData(user || null);
            setShowUserList(false);
        } else {
            setSelectedUserData(null);
        }
    }, [selectedUser, users]);

    const handleSubmit = async () => {
        if (!selectedUser) {
            alert("Please select a user first");
            return;
        }

        setLoading(true);

        try {
            const facilityId = sessionStorage.getItem("facilityId");

            if (!facilityId) {
                alert("No facility selected");
                setLoading(false); // ✅ FIX
                return;
            }

            const payload = {
                profile_id: selectedUser,
                facility_id: facilityId,
                patient_profile: {
                    date_of_birth: dob || null,
                    gender: gender || null,
                    blood_type: bloodType || null,
                    height_cm: height ? Number(height) : null,
                    weight_kg: weight ? Number(weight) : null,
                    allergies: allergies || null,
                    chronic_conditions: chronic || null,
                    emergency_contact: emergency || null,
                },
            };

            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(
                    result?.message || result?.error || "Failed to add patient"
                );
            }

            // Reset form
            setSelectedUser("");
            setSelectedUserData(null);
            setDob("");
            setGender("");
            setBloodType("");
            setHeight("");
            setWeight("");
            setAllergies("");
            setChronic("");
            setEmergency("");
            setSearchQuery("");

            onCreated();
        } catch (error) {
            console.error("Add patient error:", error);

            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Failed to add patient");
            }
        } finally {
            setLoading(false);
        }
    };

    // Get user initials for avatar
    const getUserInitials = (name: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Sheet onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent className="sm:max-w-xl w-full overflow-y-auto p-0">
                <div className="p-6">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="size-6 text-primary" />
                            Add New Patient
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Select an existing user and add their medical
                            information
                        </p>
                    </SheetHeader>

                    {/* User Selection Section */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Select User
                            </Label>

                            {/* Selected User Display */}
                            {selectedUserData ? (
                                <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                                    <CardContent className="p-4">
                                        <div
                                            className="flex items-start justify-between"
                                            onClick={() =>
                                                setShowUserList(true)
                                            }
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <Avatar className="size-10 border-2 border-primary/20">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {getUserInitials(
                                                            selectedUserData.full_name
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold truncate">
                                                            {selectedUserData.full_name ||
                                                                "Unnamed User"}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs shrink-0"
                                                        >
                                                            <Check className="size-3 mr-1" />
                                                            Selected
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {selectedUserData.email}
                                                    </p>
                                                    {selectedUserData.phone_number && (
                                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                            <Phone className="size-3" />
                                                            <span className="truncate">
                                                                {
                                                                    selectedUserData.phone_number
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="shrink-0 ml-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedUser("");
                                                    setSelectedUserData(null);
                                                }}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                    onClick={() => setShowUserList(true)}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserCircle className="size-5 text-muted-foreground" />
                                        <div className="text-left">
                                            <p className="font-medium">
                                                Click to select a user
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {users.length} users available
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* User Selection Modal */}
                    {showUserList && (
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                                <div className="p-6 border-b">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">
                                                Select User
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Choose a user to add as patient
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setShowUserList(false)
                                            }
                                        >
                                            <X className="size-5" />
                                        </Button>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                                        <Input
                                            placeholder="Search by name, email, or phone..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-10 pr-10 h-11 rounded-xl"
                                        />
                                        {searchQuery && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 size-7"
                                                onClick={() =>
                                                    setSearchQuery("")
                                                }
                                            >
                                                <X className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* User List */}
                                <ScrollArea className="h-[400px]">
                                    {loadingUsers ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Loader2 className="size-8 animate-spin text-primary mb-4" />
                                            <p className="text-muted-foreground">
                                                Loading users...
                                            </p>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <User className="size-12 text-muted-foreground mx-auto mb-4" />
                                            <h4 className="font-semibold mb-2">
                                                No users found
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {searchQuery
                                                    ? "Try a different search term"
                                                    : "No users available"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            {filteredUsers.map((user) => (
                                                <Card
                                                    key={user.id}
                                                    className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                                                        selectedUser === user.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border/50 hover:border-primary/30"
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedUser(user.id)
                                                    }
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="size-10">
                                                                <AvatarFallback
                                                                    className={
                                                                        selectedUser ===
                                                                        user.id
                                                                            ? "bg-primary text-primary-foreground"
                                                                            : "bg-muted"
                                                                    }
                                                                >
                                                                    {getUserInitials(
                                                                        user.full_name
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold truncate">
                                                                        {user.full_name ||
                                                                            "Unnamed User"}
                                                                    </span>
                                                                    {user.is_patient && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-xs"
                                                                        >
                                                                            <Shield className="size-2.5 mr-1" />
                                                                            Patient
                                                                        </Badge>
                                                                    )}
                                                                    {user.role &&
                                                                        user.role !==
                                                                            "user" && (
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-xs"
                                                                            >
                                                                                {
                                                                                    user.role
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {user.email}
                                                                </p>
                                                                {user.phone_number && (
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                        <Phone className="size-3" />
                                                                        <span>
                                                                            {
                                                                                user.phone_number
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {selectedUser ===
                                                                user.id && (
                                                                <div className="p-1 bg-primary rounded-full">
                                                                    <Check className="size-4 text-primary-foreground" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Footer */}
                                <div className="p-4 border-t bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {filteredUsers.length} of{" "}
                                            {users.length} users
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowUserList(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setShowUserList(false)
                                                }
                                                disabled={!selectedUser}
                                            >
                                                Confirm Selection
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medical Information Section - Only show when user is selected */}
                    {selectedUserData && (
                        <>
                            <Separator className="my-6" />

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                        <HeartPulse className="size-5 text-primary" />
                                        Medical Information
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Provide the patient{"'"}s medical
                                        details below
                                    </p>
                                </div>

                                {/* Personal Details */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date of Birth */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="dob"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Calendar className="size-4" />
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={dob}
                                                onChange={(e) =>
                                                    setDob(e.target.value)
                                                }
                                                className="rounded-xl h-11"
                                            />
                                        </div>

                                        {/* Gender */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="gender"
                                                className="text-sm font-medium"
                                            >
                                                Gender
                                            </Label>
                                            <Select
                                                value={gender}
                                                onValueChange={setGender}
                                            >
                                                <SelectTrigger
                                                    id="gender"
                                                    className="rounded-xl h-11"
                                                >
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {genders.map((g) => (
                                                        <SelectItem
                                                            key={g}
                                                            value={g}
                                                            className="rounded-lg"
                                                        >
                                                            {g}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Blood Type */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="blood-type"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Droplets className="size-4 text-destructive" />
                                                Blood Type
                                            </Label>
                                            <Select
                                                value={bloodType}
                                                onValueChange={setBloodType}
                                            >
                                                <SelectTrigger
                                                    id="blood-type"
                                                    className="rounded-xl h-11"
                                                >
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {bloodTypes.map((type) => (
                                                        <SelectItem
                                                            key={type}
                                                            value={type}
                                                            className="rounded-lg"
                                                        >
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Height */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="height"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Ruler className="size-4" />
                                                Height (cm)
                                            </Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                placeholder="e.g., 175"
                                                value={height}
                                                onChange={(e) =>
                                                    setHeight(e.target.value)
                                                }
                                                className="rounded-xl h-11"
                                            />
                                        </div>

                                        {/* Weight */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="weight"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
                                                <Scale className="size-4" />
                                                Weight (kg)
                                            </Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                placeholder="e.g., 70"
                                                value={weight}
                                                onChange={(e) =>
                                                    setWeight(e.target.value)
                                                }
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                    </div>

                                    {/* BMI Calculation */}
                                    {height && weight && (
                                        <div className="bg-muted/50 rounded-xl p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    BMI Calculation
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono"
                                                >
                                                    {(() => {
                                                        const h =
                                                            parseFloat(height) /
                                                            100;
                                                        const w =
                                                            parseFloat(weight);
                                                        if (h > 0 && w > 0) {
                                                            const bmi =
                                                                w / (h * h);
                                                            return bmi.toFixed(
                                                                1
                                                            );
                                                        }
                                                        return "N/A";
                                                    })()}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Medical History */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-medium">
                                        Medical History
                                    </Label>

                                    {/* Allergies */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="size-4 text-amber-600" />
                                            <span className="text-sm font-medium">
                                                Allergies
                                            </span>
                                        </div>
                                        <Textarea
                                            placeholder="List any allergies (e.g., Penicillin, Peanuts, Latex)"
                                            value={allergies}
                                            onChange={(e) =>
                                                setAllergies(e.target.value)
                                            }
                                            className="rounded-xl min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Chronic Conditions */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <HeartPulse className="size-4 text-destructive" />
                                            <span className="text-sm font-medium">
                                                Chronic Conditions
                                            </span>
                                        </div>
                                        <Textarea
                                            placeholder="List any chronic conditions (e.g., Diabetes, Hypertension, Asthma)"
                                            value={chronic}
                                            onChange={(e) =>
                                                setChronic(e.target.value)
                                            }
                                            className="rounded-xl min-h-[80px] resize-none"
                                        />
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="emergency"
                                            className="text-sm font-medium flex items-center gap-2"
                                        >
                                            <Phone className="size-4 text-destructive" />
                                            Emergency Contact
                                        </Label>
                                        <Input
                                            id="emergency"
                                            placeholder="Name and phone number (e.g., John Doe - +1 234 567 8900)"
                                            value={emergency}
                                            onChange={(e) =>
                                                setEmergency(e.target.value)
                                            }
                                            className="rounded-xl h-11"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Include name and phone number of
                                            emergency contact person
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 pt-6 border-t">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl text-base font-medium"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="size-5 animate-spin mr-2" />
                                            Adding Patient...
                                        </>
                                    ) : (
                                        <>
                                            <User className="size-5 mr-2" />
                                            Add as Patient
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    This will create a medical profile for{" "}
                                    {selectedUserData.full_name ||
                                        selectedUserData.email}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
