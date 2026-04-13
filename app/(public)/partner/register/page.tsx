"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Building2,
	MapPin,
	UserCircle,
	Eye,
	EyeOff,
	Phone,
	Mail,
	Lock,
	ChevronRight,
	CheckCircle,
	Shield,
	Activity,
} from "lucide-react";
import PageTitle from "@/components/page-title";
import {
	Stepper,
	StepperContent,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperList,
	StepperNext,
	StepperPrev,
	StepperTitle,
	StepperTrigger,
	type StepperProps,
} from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import {
	Field,
	FieldDescription,
	FieldError,
} from "@/components/ui/field";

const registerSchema = z.object({
	name: z.string().trim().min(1, "Facility name is required"),
	type: z.string().trim().min(1, "Facility type is required"),
	specialty: z.string().trim().optional(),
	phone: z.string().trim().optional(),
	address: z.string().trim().min(1, "Address is required"),
	latitude: z
		.string()
		.trim()
		.refine(
			(value: string) => value === "" || !Number.isNaN(Number(value)),
			"Latitude must be a valid number",
		)
		.optional(),
	longitude: z
		.string()
		.trim()
		.refine(
			(value: string) => value === "" || !Number.isNaN(Number(value)),
			"Longitude must be a valid number",
		)
		.optional(),
	adminName: z.string().trim().min(1, "Admin name is required"),
	adminEmail: z
		.string()
		.trim()
		.min(1, "Admin email is required")
		.email("Invalid email format"),
	adminPassword: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const steps = [
	{
		value: "facility",
		title: "Facility Details",
		icon: Building2,
		description: "Basic information about your healthcare facility",
		fields: ["name", "type", "specialty", "phone"] as const,
	},
	{
		value: "location",
		title: "Location",
		icon: MapPin,
		description: "Where your facility is located",
		fields: ["address", "latitude", "longitude"] as const,
	},
	{
		value: "admin",
		title: "Admin Account",
		icon: UserCircle,
		description: "Create your administrator account",
		fields: ["adminName", "adminEmail", "adminPassword"] as const,
	},
] as const;

export default function RegisterClinicPage() {
	const router = useRouter();
	const [mounted, setMounted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [currentStep, setCurrentStep] = useState("facility");

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			type: "",
			specialty: "",
			phone: "",
			address: "",
			latitude: "",
			longitude: "",
			adminName: "",
			adminEmail: "",
			adminPassword: "",
		},
		mode: "onTouched",
	});

	const onStepChange: StepperProps["onValidate"] = async (_value, direction) => {
		if (direction === "prev") return true;

		const stepData = steps.find((step) => step.value === currentStep);
		if (!stepData) {
			return true;
		}

		const isValid = await form.trigger(stepData.fields);
		if (!isValid) {
			toast.error("Validation Error", {
				description: "Please complete all required fields to continue",
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async (values: RegisterFormValues) => {
		const payload = {
			facility: {
				name: values.name,
				type: values.type,
				specialty: values.specialty?.trim() || "",
				phone: values.phone?.trim() || "",
				address: values.address,
				latitude: values.latitude?.trim() || null,
				longitude: values.longitude?.trim() || null,
			},
			admin: {
				name: values.adminName,
				email: values.adminEmail,
				password: values.adminPassword,
			},
		};

		toast.promise(
			new Promise(async (resolve, reject) => {
				setLoading(true);

				try {
					const res = await fetch("/api/facility/register", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(payload),
					});

					const result = await res.json();

					if (!res.ok) {
						throw new Error(result.error || "Registration failed");
					}

					setTimeout(() => {
						router.push("/auth/admin");
					}, 1500);

					resolve(result);
				} catch (error: any) {
					reject(error);
				} finally {
					setLoading(false);
				}
			}),
			{
				loading: "Registering your facility...",
				success: (data: any) => {
					return `Registration successful! Welcome ${
						data.facility?.name || "Facility"
					}. Redirecting...`;
				},
				error: (error) => {
					return error.message || "Registration failed. Please try again.";
				},
			},
		);
	};

	const getCurrentStepIndex = () =>
		steps.findIndex((s) => s.value === currentStep);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="min-h-screen bg-linear-to-b from-background via-primary/5 to-background p-4 md:p-6">
				<PageTitle title="Register Health Center" />
				<div className="max-w-4xl mx-auto pt-24 pb-12">
					<Card className="border-2 shadow-lg overflow-hidden pt-0">
						<CardHeader className="bg-linear-to-r from-primary/5 to-primary/10 border-b pt-6">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-2xl flex items-center gap-3">
										<Building2 className="h-6 w-6 text-primary" />
										Facility Registration Wizard
									</CardTitle>
									<CardDescription>
										Loading registration form...
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-8">
							<div className="h-96 animate-pulse rounded-2xl bg-muted/40" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-background via-primary/5 to-background p-4 md:p-6">
			<PageTitle title="Register Health Center" />

			<div className="max-w-4xl mx-auto pt-24 pb-12">
				{/* Header Section */}
				<div className="text-center mb-12 space-y-4">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
						<Building2 className="h-3 w-3" />
						Healthcare Facility Registration
					</div>
					<h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
						Register Your Healthcare Facility
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Complete all {steps.length} steps to register your facility and start
						managing healthcare operations
					</p>
				</div>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-6"
					noValidate
				>
					<Stepper
						value={currentStep}
						onValueChange={setCurrentStep}
						onValidate={onStepChange}
						className="w-full"
					>
						<StepperList className="grid grid-cols-1 gap-4 md:grid-cols-3">
							{steps.map((step, index) => (
								<StepperItem
									key={step.value}
									value={step.value}
									className="items-start"
								>
									<StepperTrigger className="group h-auto w-full justify-start rounded-2xl border border-border/60 bg-background/80 px-4 py-4 transition data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=completed]:border-primary/40 data-[state=completed]:bg-primary/5">
										<StepperIndicator className="size-10">
											{index + 1}
										</StepperIndicator>
										<span className="flex min-w-0 flex-col gap-1">
											<StepperTitle>{step.title}</StepperTitle>
											<StepperDescription>
												{step.description}
											</StepperDescription>
										</span>
									</StepperTrigger>
								</StepperItem>
							))}
						</StepperList>

						<Card className="border-2 shadow-lg overflow-hidden pt-0">
							<CardHeader className="bg-linear-to-r from-primary/5 to-primary/10 border-b pt-6">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-2xl flex items-center gap-3">
											<Building2 className="h-6 w-6 text-primary" />
											Facility Registration Wizard
										</CardTitle>
										<CardDescription>
											{steps[getCurrentStepIndex()].description}
										</CardDescription>
									</div>
									<div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold">
										Step {getCurrentStepIndex() + 1}/{steps.length}
									</div>
								</div>
							</CardHeader>
							<CardContent className="p-8">

								{/* Facility Details Step */}
								<StepperContent
									value="facility"
									className="animate-in fade-in slide-in-from-top-4 duration-300"
								>
									<div className="space-y-6">
										<div className="flex items-center gap-3 mb-6">
											<div className="p-2 rounded-lg bg-primary/10">
												<Building2 className="h-5 w-5 text-primary" />
											</div>
											<div>
												<h3 className="text-xl font-semibold">Facility Details</h3>
												<p className="text-sm text-muted-foreground">
													Tell us about your healthcare facility
												</p>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-6">
											<Field className="space-y-3">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Building2 className="h-3 w-3" />
													Facility Name *
												</Label>
												<Input
													{...form.register("name")}
													placeholder="City General Hospital"
													className="h-12 rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
													aria-invalid={!!form.formState.errors.name}
												/>
												<FieldError errors={[form.formState.errors.name]} />
											</Field>

											<Field className="space-y-3">
												<Label className="text-sm font-medium">Facility Type *</Label>
												<Controller
													control={form.control}
													name="type"
													render={({ field }) => (
														<Select
															value={field.value}
															onValueChange={field.onChange}
														>
															<SelectTrigger
																className="h-12 rounded-xl border-2"
																aria-invalid={!!form.formState.errors.type}
															>
																<SelectValue placeholder="Select facility type" />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="Clinic">Clinic</SelectItem>
																<SelectItem value="Hospital">Hospital</SelectItem>
																<SelectItem value="Pharmacy">Pharmacy</SelectItem>
																<SelectItem value="Lab">Laboratory</SelectItem>
															</SelectContent>
														</Select>
													)}
												/>
												<FieldError errors={[form.formState.errors.type]} />
											</Field>

											<Field className="space-y-3">
												<Label className="text-sm font-medium">Specialty</Label>
												<Input
													{...form.register("specialty")}
													placeholder="Cardiology, Pediatrics, etc."
													className="h-12 rounded-xl border-2"
												/>
											</Field>

											<Field className="space-y-3">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Phone className="h-3 w-3" />
													Phone Number
												</Label>
												<Input
													{...form.register("phone")}
													placeholder="+1 (555) 123-4567"
													className="h-12 rounded-xl border-2"
												/>
											</Field>
										</div>
									</div>
								</StepperContent>

								{/* Location Step */}
								<StepperContent
									value="location"
									className="animate-in fade-in slide-in-from-top-4 duration-300"
								>
									<div className="space-y-6">
										<div className="flex items-center gap-3 mb-6">
											<div className="p-2 rounded-lg bg-primary/10">
												<MapPin className="h-5 w-5 text-primary" />
											</div>
											<div>
												<h3 className="text-xl font-semibold">Location Information</h3>
												<p className="text-sm text-muted-foreground">
													Where your facility is located
												</p>
											</div>
										</div>

										<div className="space-y-6">
											<Field className="space-y-3">
												<Label className="text-sm font-medium">Full Address *</Label>
												<Textarea
													className="w-full border-2 rounded-xl p-4 resize-none min-h-30 focus:border-primary focus:ring-2 focus:ring-primary/20"
													rows={3}
													{...form.register("address")}
													placeholder="123 Medical Center Drive, Suite 100, City, State, ZIP"
													aria-invalid={!!form.formState.errors.address}
												/>
												<FieldError errors={[form.formState.errors.address]} />
											</Field>

											<div className="grid md:grid-cols-2 gap-6">
												<Field className="space-y-3">
													<Label className="text-sm font-medium">Latitude</Label>
													<Input
														type="number"
														step="any"
														{...form.register("latitude")}
														placeholder="e.g. 37.7749"
														className="h-12 rounded-xl border-2"
														aria-invalid={!!form.formState.errors.latitude}
													/>
													<FieldDescription>
														Optional: For precise location mapping
													</FieldDescription>
													<FieldError errors={[form.formState.errors.latitude]} />
												</Field>

												<Field className="space-y-3">
													<Label className="text-sm font-medium">Longitude</Label>
													<Input
														type="number"
														step="any"
														{...form.register("longitude")}
														placeholder="e.g. -122.4194"
														className="h-12 rounded-xl border-2"
														aria-invalid={!!form.formState.errors.longitude}
													/>
													<FieldDescription>
														Optional: For precise location mapping
													</FieldDescription>
													<FieldError errors={[form.formState.errors.longitude]} />
												</Field>
											</div>
										</div>
									</div>
								</StepperContent>

								{/* Admin Account Step */}
								<StepperContent
									value="admin"
									className="animate-in fade-in slide-in-from-top-4 duration-300"
								>
									<div className="space-y-6">
										<div className="flex items-center gap-3 mb-6">
											<div className="p-2 rounded-lg bg-primary/10">
												<UserCircle className="h-5 w-5 text-primary" />
											</div>
											<div>
												<h3 className="text-xl font-semibold">Administrator Account</h3>
												<p className="text-sm text-muted-foreground">
													Create your primary admin account
												</p>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-6">
											<Field className="space-y-3">
												<Label className="text-sm font-medium flex items-center gap-2">
													<UserCircle className="h-3 w-3" />
													Admin Name *
												</Label>
												<Input
													{...form.register("adminName")}
													placeholder="John Doe"
													className="h-12 rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
													aria-invalid={!!form.formState.errors.adminName}
												/>
												<FieldError errors={[form.formState.errors.adminName]} />
											</Field>

											<Field className="space-y-3">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Mail className="h-3 w-3" />
													Email Address *
												</Label>
												<Input
													type="email"
													{...form.register("adminEmail")}
													placeholder="admin@facility.com"
													className="h-12 rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
													aria-invalid={!!form.formState.errors.adminEmail}
												/>
												<FieldError errors={[form.formState.errors.adminEmail]} />
											</Field>

											<Field className="space-y-3 md:col-span-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Lock className="h-3 w-3" />
													Password *
												</Label>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														{...form.register("adminPassword")}
														placeholder="At least 6 characters"
														className="h-12 rounded-xl border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
														aria-invalid={!!form.formState.errors.adminPassword}
													/>
													<button
														type="button"
														className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted p-2 rounded-lg transition-colors"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className="h-4 w-4 text-muted-foreground" />
														) : (
															<Eye className="h-4 w-4 text-muted-foreground" />
														)}
													</button>
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
													Must be at least 6 characters long
												</div>
												<FieldError errors={[form.formState.errors.adminPassword]} />
											</Field>
										</div>

										{/* Security Note */}
										<div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
											<div className="flex items-start gap-3">
												<Shield className="h-5 w-5 text-primary mt-0.5" />
												<div>
													<h4 className="font-medium">Secure Account Creation</h4>
													<p className="text-sm text-muted-foreground">
														Your account details will be handled carefully.
														You'll receive a verification email after registration.
													</p>
												</div>
											</div>
										</div>
									</div>
								</StepperContent>

								{/* Navigation Buttons */}
								<div className="mt-10 pt-6 border-t flex justify-between items-center">
									<StepperPrev asChild>
										<Button
											type="button"
											variant="outline"
											className="h-12 px-6 rounded-xl gap-2"
											disabled={currentStep === steps[0].value}
										>
											<ChevronRight className="h-4 w-4 rotate-180" />
											Back
										</Button>
									</StepperPrev>

									<div className="flex items-center gap-4">
										{currentStep === steps[steps.length - 1].value ? (
											<Button
												type="submit"
												disabled={loading}
												className="h-12 px-8 rounded-xl gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
											>
												{loading ? (
													<>
														<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
														Registering Facility...
													</>
												) : (
													<>
														<CheckCircle className="h-5 w-5" />
														Complete Registration
													</>
												)}
											</Button>
										) : (
											<StepperNext asChild>
												<Button
													type="button"
													className="h-12 px-8 rounded-xl gap-2 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
												>
													Continue
													<ChevronRight className="h-4 w-4" />
												</Button>
											</StepperNext>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</Stepper>
				</form>

				{/* Features Footer */}
				<div className="mt-8 grid md:grid-cols-3 gap-4">
					<Card className="border">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-semibold">Privacy-minded setup</h4>
								<p className="text-xs text-muted-foreground">
									Careful handling of facility information
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className="border">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Activity className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-semibold">Quick Setup</h4>
								<p className="text-xs text-muted-foreground">Get started in minutes</p>
							</div>
						</CardContent>
					</Card>
					<Card className="border">
						<CardContent className="p-4 flex items-center gap-3">
							<div className="p-2 rounded-lg bg-primary/10">
								<Building2 className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h4 className="font-semibold">24/7 Support</h4>
								<p className="text-xs text-muted-foreground">
									Dedicated healthcare support
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
