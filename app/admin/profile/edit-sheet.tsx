"use client";

import React, { useEffect, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Award, Calendar, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AuthUser } from "@/app/types";

interface EditStaffProfileModalProps {
	user: AuthUser;
	onSave: (updatedData: Partial<AuthUser>) => Promise<boolean>;
	onClose: () => void;
}

export default function EditStaffProfileModal({
	user,
	onSave,
	onClose,
}: EditStaffProfileModalProps) {
	const [formData, setFormData] = useState<Partial<AuthUser>>({
		full_name: user.full_name,
		email: user.email,
		specialization: user.specialization,
		license_number: user.license_number,
		years_of_experience: user.years_of_experience,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());

	useEffect(() => {
		setFormData({
			full_name: user.full_name,
			email: user.email,
			specialization: user.specialization,
			license_number: user.license_number,
			years_of_experience: user.years_of_experience,
		});
	}, [user]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setDirtyFields((prev) => new Set(prev).add(name));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.full_name?.trim()) {
			toast.error("Full name is required");
			return;
		}

		if (!formData.email?.trim()) {
			toast.error("Email is required");
			return;
		}

		setIsSubmitting(true);

		try {
			const ok = await onSave({
				full_name: formData.full_name,
				email: formData.email,
				specialization: formData.specialization,
				license_number: formData.license_number,
				years_of_experience:
					formData.years_of_experience === null ||
					formData.years_of_experience === undefined
						? null
						: Number(formData.years_of_experience),
			});

			if (ok) {
				toast.success("Profile updated successfully");
				onClose();
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasChanges = () => {
		return (
			formData.full_name !== user.full_name ||
			formData.email !== user.email ||
			formData.specialization !== user.specialization ||
			formData.license_number !== user.license_number ||
			formData.years_of_experience !== user.years_of_experience
		);
	};

	return (
		<Sheet open onOpenChange={(open) => !open && onClose()}>
			<SheetContent className="sm:max-w-lg p-0 border-l shadow-xl flex flex-col h-full">
				<SheetHeader className="p-6 border-b flex-shrink-0">
					<div className="flex items-center justify-between">
						<SheetTitle className="text-xl font-semibold tracking-tight">
							Edit profile
						</SheetTitle>
						<button
							onClick={onClose}
							className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</button>
					</div>
					<p className="text-sm text-muted-foreground">
						Update your personal information and professional details here.
					</p>
				</SheetHeader>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col flex-1 overflow-hidden"
				>
					<div className="flex-1 overflow-y-auto p-6 space-y-5">
						{/* Full Name */}
						<div className="space-y-2">
							<Label htmlFor="full_name" className="text-sm font-medium">
								Full name
							</Label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="full_name"
									name="full_name"
									value={formData.full_name || ""}
									onChange={handleInputChange}
									placeholder="John Doe"
									className="pl-9 h-10"
									required
								/>
							</div>
						</div>

						{/* Email */}
						<div className="space-y-2">
							<Label htmlFor="email" className="text-sm font-medium">
								Email address
							</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email || ""}
									onChange={handleInputChange}
									placeholder="john@example.com"
									className="pl-9 h-10"
									required
								/>
							</div>
						</div>

						{/* Specialization */}
						<div className="space-y-2">
							<Label htmlFor="specialization" className="text-sm font-medium">
								Specialization
							</Label>
							<div className="relative">
								<Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="specialization"
									name="specialization"
									value={formData.specialization || ""}
									onChange={handleInputChange}
									placeholder="e.g., Cardiology"
									className="pl-9 h-10"
								/>
							</div>
						</div>

						{/* License Number */}
						<div className="space-y-2">
							<Label htmlFor="license_number" className="text-sm font-medium">
								License number
							</Label>
							<div className="relative">
								<FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="license_number"
									name="license_number"
									value={formData.license_number || ""}
									onChange={handleInputChange}
									placeholder="MED-12345"
									className="pl-9 h-10"
								/>
							</div>
						</div>

						{/* Years of Experience */}
						<div className="space-y-2">
							<Label htmlFor="years_of_experience" className="text-sm font-medium">
								Years of experience
							</Label>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="years_of_experience"
									name="years_of_experience"
									type="number"
									min="0"
									max="50"
									value={formData.years_of_experience ?? ""}
									onChange={handleInputChange}
									placeholder="0"
									className="pl-9 h-10"
								/>
							</div>
						</div>
					</div>

					<SheetFooter className="p-6 border-t flex-shrink-0">
						<div className="flex gap-3 w-full">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !hasChanges()}
								className="flex-1 gap-2"
							>
								{isSubmitting ? (
									<>
										<div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Check className="w-4 h-4" />
										Save changes
									</>
								)}
							</Button>
						</div>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
