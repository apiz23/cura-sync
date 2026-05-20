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
	Clock,
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
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand-logo";

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
		if (!stepData) return true;

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
					if (!res.ok) throw new Error(result.error || "Registration failed");
					setTimeout(() => { router.push("/auth/admin"); }, 1500);
					resolve(result);
				} catch (error: any) {
					reject(error);
				} finally {
					setLoading(false);
				}
			}),
			{
				loading: "Registering your facility...",
				success: (data: any) =>
					`Registration successful! Welcome ${data.facility?.name || "Facility"}. Redirecting...`,
				error: (error) => error.message || "Registration failed. Please try again.",
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
			<div className="min-h-[100dvh] bg-background px-4 pb-12 pt-20">
				<PageTitle title="Register Health Center" />
				<div className="mx-auto max-w-4xl pt-12">
					<div className="space-y-3 mb-8">
						<div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
						<div className="h-9 w-80 animate-pulse rounded-md bg-muted" />
						<div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
					</div>
					<Card className="border shadow-sm overflow-hidden pt-0">
						<CardContent className="p-8">
							<div className="h-96 animate-pulse rounded-xl bg-muted/40" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[100dvh] bg-background px-4 pb-12 pt-20">
			<PageTitle title="Register Health Center" />

			<div className="mx-auto max-w-4xl pt-12 pb-12">
				{/* Header — left-aligned, not centered */}
				<div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<BrandLogo className="h-8 w-8 shrink-0" imageClassName="p-0.5" />
							<Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
								Partner Onboarding
							</Badge>
						</div>
						<h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
							Register your healthcare facility
						</h1>
						<p className="max-w-md text-base text-muted-foreground">
							Complete all {steps.length} steps to register your facility and start
							managing clinic operations on CuraSync.
						</p>
					</div>
					{/* Step counter — right side */}
					<div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
							<span className="text-sm font-semibold text-foreground">
								Step {getCurrentStepIndex() + 1} of {steps.length}
							</span>
						</div>
						<p className="text-xs text-muted-foreground">
							{steps[getCurrentStepIndex()]?.description}
						</p>
					</div>
				</div>

				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
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
											<StepperDescription>{step.description}</StepperDescription>
										</span>
									</StepperTrigger>
								</StepperItem>
							))}
						</StepperList>

						<Card className="border shadow-sm overflow-hidden pt-0">
							<CardHeader className="border-b bg-muted/20 pt-6">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="flex items-center gap-2 text-xl">
											<Building2 className="h-5 w-5 text-primary" />
											Facility Registration
										</CardTitle>
										<CardDescription>
											{steps[getCurrentStepIndex()].description}
										</CardDescription>
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
												<h3 className="text-lg font-semibold">Facility Details</h3>
												<p className="text-sm text-muted-foreground">
													Tell us about your healthcare facility
												</p>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-6">
											<Field className="space-y-2">
												<Label className="text-sm font-medium">Facility Name *</Label>
												<Input
													{...form.register("name")}
													placeholder="Klinik Al-Fattah"
													className="h-11 rounded-xl border-2 focus:border-primary"
													aria-invalid={!!form.formState.errors.name}
												/>
												<FieldError errors={[form.formState.errors.name]} />
											</Field>

											<Field className="space-y-2">
												<Label className="text-sm font-medium">Facility Type *</Label>
												<Controller
													control={form.control}
													name="type"
													render={({ field }) => (
														<Select value={field.value} onValueChange={field.onChange}>
															<SelectTrigger
																className="h-11 rounded-xl border-2"
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

											<Field className="space-y-2">
												<Label className="text-sm font-medium">Specialty</Label>
												<Input
													{...form.register("specialty")}
													placeholder="Cardiology, Paediatrics, etc."
													className="h-11 rounded-xl border-2"
												/>
											</Field>

											<Field className="space-y-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Phone className="h-3 w-3" />
													Phone Number
												</Label>
												<Input
													{...form.register("phone")}
													placeholder="+60 3-1234 5678"
													className="h-11 rounded-xl border-2"
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
												<h3 className="text-lg font-semibold">Location Information</h3>
												<p className="text-sm text-muted-foreground">
													Where your facility is located
												</p>
											</div>
										</div>

										<div className="space-y-6">
											<Field className="space-y-2">
												<Label className="text-sm font-medium">Full Address *</Label>
												<Textarea
													className="w-full border-2 rounded-xl p-4 resize-none min-h-28 focus:border-primary"
													rows={3}
													{...form.register("address")}
													placeholder="123 Jalan Klang Lama, Taman Sri Sentosa, 58000 Kuala Lumpur"
													aria-invalid={!!form.formState.errors.address}
												/>
												<FieldError errors={[form.formState.errors.address]} />
											</Field>

											<div className="grid md:grid-cols-2 gap-6">
												<Field className="space-y-2">
													<Label className="text-sm font-medium">Latitude</Label>
													<Input
														type="number"
														step="any"
														{...form.register("latitude")}
														placeholder="e.g. 3.1390"
														className="h-11 rounded-xl border-2"
														aria-invalid={!!form.formState.errors.latitude}
													/>
													<FieldDescription>
														Optional — for precise map pinning
													</FieldDescription>
													<FieldError errors={[form.formState.errors.latitude]} />
												</Field>

												<Field className="space-y-2">
													<Label className="text-sm font-medium">Longitude</Label>
													<Input
														type="number"
														step="any"
														{...form.register("longitude")}
														placeholder="e.g. 101.6869"
														className="h-11 rounded-xl border-2"
														aria-invalid={!!form.formState.errors.longitude}
													/>
													<FieldDescription>
														Optional — for precise map pinning
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
												<h3 className="text-lg font-semibold">Administrator Account</h3>
												<p className="text-sm text-muted-foreground">
													Create your primary admin account
												</p>
											</div>
										</div>

										<div className="grid md:grid-cols-2 gap-6">
											<Field className="space-y-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<UserCircle className="h-3 w-3" />
													Admin Name *
												</Label>
												<Input
													{...form.register("adminName")}
													placeholder="Dr. Ahmad Fadzillah"
													className="h-11 rounded-xl border-2 focus:border-primary"
													aria-invalid={!!form.formState.errors.adminName}
												/>
												<FieldError errors={[form.formState.errors.adminName]} />
											</Field>

											<Field className="space-y-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Mail className="h-3 w-3" />
													Email Address *
												</Label>
												<Input
													type="email"
													{...form.register("adminEmail")}
													placeholder="admin@klinik.com.my"
													className="h-11 rounded-xl border-2 focus:border-primary"
													aria-invalid={!!form.formState.errors.adminEmail}
												/>
												<FieldError errors={[form.formState.errors.adminEmail]} />
											</Field>

											<Field className="space-y-2 md:col-span-2">
												<Label className="text-sm font-medium flex items-center gap-2">
													<Lock className="h-3 w-3" />
													Password *
												</Label>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														{...form.register("adminPassword")}
														placeholder="At least 6 characters"
														className="h-11 rounded-xl border-2 focus:border-primary pr-12"
														aria-invalid={!!form.formState.errors.adminPassword}
													/>
													<button
														type="button"
														className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 hover:bg-muted transition-colors"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className="h-4 w-4 text-muted-foreground" />
														) : (
															<Eye className="h-4 w-4 text-muted-foreground" />
														)}
													</button>
												</div>
												<FieldDescription>Must be at least 6 characters</FieldDescription>
												<FieldError errors={[form.formState.errors.adminPassword]} />
											</Field>
										</div>

										<div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
											<div className="flex items-start gap-3">
												<Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
												<div>
													<p className="text-sm font-medium text-foreground">
														Secure account creation
													</p>
													<p className="text-xs text-muted-foreground mt-0.5">
														Your account details are handled carefully. You will receive a
														verification email after registration.
													</p>
												</div>
											</div>
										</div>
									</div>
								</StepperContent>

								{/* Navigation */}
								<div className="mt-10 flex items-center justify-between border-t pt-6">
									<StepperPrev asChild>
										<Button
											type="button"
											variant="outline"
											className="h-11 gap-2 rounded-xl px-6 transition-all duration-200 active:scale-[0.98]"
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
												className="h-11 gap-2 rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
											>
												{loading ? (
													<>
														<div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
														Registering...
													</>
												) : (
													<>
														<CheckCircle className="h-4 w-4" />
														Complete Registration
													</>
												)}
											</Button>
										) : (
											<StepperNext asChild>
												<Button
													type="button"
													className="h-11 gap-2 rounded-xl px-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
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

				{/* Trust strip — no card boxes, just a bordered row */}
				<div className="mt-8 grid grid-cols-1 divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
					{[
						{
							icon: Shield,
							title: "Privacy-minded setup",
							description: "Careful handling of facility information",
						},
						{
							icon: Activity,
							title: "Up and running in minutes",
							description: "No hardware or lengthy onboarding required",
						},
						{
							icon: Clock,
							title: "Support when you need it",
							description: "Our team is reachable during business hours",
						},
					].map((item) => (
						<div key={item.title} className="flex items-start gap-3 px-6 py-5 first:pl-0 last:pr-0 sm:first:pl-0">
							<div className="mt-0.5 rounded-md bg-primary/10 p-1.5 shrink-0">
								<item.icon className="h-4 w-4 text-primary" />
							</div>
							<div>
								<p className="text-sm font-semibold text-foreground">{item.title}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
