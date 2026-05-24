"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	User,
	Mail,
	Calendar,
	Award,
	Briefcase,
	Clock,
	Stethoscope,
	Shield,
	UserCog,
	CheckCircle,
	XCircle,
	MoreHorizontal,
	Edit,
	Trash2,
	Building,
	Key,
	Database,
	ShieldCheck,
	Activity,
	BriefcaseMedical,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Staff } from "@/app/types";
import { cn } from "@/lib/utils";

interface ViewStaffSheetProps {
	staff: Staff | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit?: (staff: Staff) => void;
	onDelete?: (id: string) => void;
}

export default function ViewStaffSheet({
	staff,
	open,
	onOpenChange,
	onEdit,
	onDelete,
}: ViewStaffSheetProps) {
	if (!staff) return null;

	const getRoleIcon = (role: Staff["role"] | null) => {
		switch (role) {
			case "doctor":
				return <Stethoscope className="w-4 h-4" />;
			case "staff":
				return <Shield className="w-4 h-4" />;
			case "admin":
				return <UserCog className="w-4 h-4" />;
			default:
				return <User className="w-4 h-4" />;
		}
	};

	const getRoleColor = (role: Staff["role"] | null) => {
		switch (role) {
			case "doctor":
				return "bg-chart-2/10 text-chart-2 border-chart-2/30 dark:bg-chart-2/15/20 dark:text-chart-2";
			case "staff":
				return "bg-chart-3/10 text-chart-3 border-chart-3/30 dark:bg-chart-3/15/20 dark:text-chart-3";
			case "admin":
				return "bg-chart-4/100/10 text-chart-4 border-chart-4/30 dark:bg-chart-4/15/20 dark:text-chart-4";
			default:
				return "bg-muted text-muted-foreground border-border";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getDayName = (day: string) => {
		const dayMap: Record<string, string> = {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
		};
		return dayMap[day] || day;
	};

	// Calculate years of experience if not provided
	const calculateExperience = () => {
		if (staff.years_of_experience) return staff.years_of_experience;
		const joinDate = new Date(staff.created_at);
		const now = new Date();
		const diffYears = now.getFullYear() - joinDate.getFullYear();
		return Math.max(0, diffYears);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 border-l border-border/50">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-background border-b border-border/50 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Avatar className="h-14 w-14 border-2 border-primary/20">
								<AvatarImage src="" />
								<AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-semibold">
									{staff.full_name
										.split(" ")
										.map((n) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>
							<div>
								<SheetTitle className="text-2xl font-bold text-foreground">
									{staff.full_name}
								</SheetTitle>
								<div className="flex items-center gap-2 mt-2">
									<Badge
										className={cn(
											"gap-1.5 px-3 py-1.5 font-medium",
											getRoleColor(staff.role)
										)}
										variant="outline"
									>
										{getRoleIcon(staff.role)}
										<span className="capitalize">{staff.role || "Staff Member"}</span>
									</Badge>
									{staff.specialization && (
										<Badge variant="outline" className="px-3 py-1.5 bg-secondary/20">
											<BriefcaseMedical className="w-3.5 h-3.5 mr-1.5" />
											{staff.specialization}
										</Badge>
									)}
								</div>
							</div>
						</div>
						<div className="flex items-center gap-1">
							{(onEdit || onDelete) && (
								<Button
									variant="outline"
									size="icon"
									className="h-9 w-9 rounded-lg hover:bg-muted"
									onClick={() => {
										if (onEdit) onEdit(staff);
									}}
								>
									<Edit className="h-4 w-4" />
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9 rounded-lg hover:bg-muted"
								onClick={() => onOpenChange(false)}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>

				<div className="p-6 space-y-6">
					{/* Professional Summary Card */}
					<Card className="border border-border/50 shadow-sm">
						<CardContent className="p-6">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-base text-muted-foreground">
										<User className="h-3.5 w-3.5" />
										<span>Role</span>
									</div>
									<p className="font-semibold capitalize">
										{staff.role || "Not specified"}
									</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-base text-muted-foreground">
										<Award className="h-3.5 w-3.5" />
										<span>Experience</span>
									</div>
									<p className="font-semibold">{calculateExperience()} years</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-base text-muted-foreground">
										<Calendar className="h-3.5 w-3.5" />
										<span>Joined</span>
									</div>
									<p className="font-semibold">{formatDate(staff.created_at)}</p>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2 text-base text-muted-foreground">
										<CheckCircle className="h-3.5 w-3.5" />
										<span>Status</span>
									</div>
									<Badge
										variant="outline"
										className="bg-chart-3/10 text-chart-3 border-chart-3/30"
									>
										<div className="h-2 w-2 rounded-full bg-chart-3 mr-2" />
										Active
									</Badge>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact & Identification Table */}
					<Card className="border border-border/50 shadow-sm">
						<CardContent className="p-0">
							<div className="p-6 border-b border-border/50">
								<h3 className="text-lg font-semibold flex items-center gap-2">
									<Database className="h-5 w-5 text-primary" />
									Contact & Identification
								</h3>
							</div>
							<Table>
								<TableBody>
									<TableRow className="hover:bg-transparent">
										<TableCell className="w-[180px] py-4 pl-6 font-medium text-muted-foreground">
											<div className="flex items-center gap-2">
												<Mail className="h-4 w-4" />
												Email Address
											</div>
										</TableCell>
										<TableCell className="py-4 pr-6 font-medium">{staff.email}</TableCell>
									</TableRow>

									{staff.license_number && (
										<TableRow className="hover:bg-transparent border-t border-border/50">
											<TableCell className="w-[180px] py-4 pl-6 font-medium text-muted-foreground">
												<div className="flex items-center gap-2">
													<ShieldCheck className="h-4 w-4" />
													License Number
												</div>
											</TableCell>
											<TableCell className="py-4 pr-6 font-medium">
												<Badge variant="outline" className="font-mono text-base">
													{staff.license_number}
												</Badge>
											</TableCell>
										</TableRow>
									)}

									{staff.facility_id && (
										<TableRow className="hover:bg-transparent border-t border-border/50">
											<TableCell className="w-[180px] py-4 pl-6 font-medium text-muted-foreground">
												<div className="flex items-center gap-2">
													<Building className="h-4 w-4" />
													Facility ID
												</div>
											</TableCell>
											<TableCell className="py-4 pr-6 font-medium font-mono text-base">
												{staff.facility_id}
											</TableCell>
										</TableRow>
									)}

									<TableRow className="hover:bg-transparent border-t border-border/50">
										<TableCell className="w-[180px] py-4 pl-6 font-medium text-muted-foreground">
											<div className="flex items-center gap-2">
												<Key className="h-4 w-4" />
												Staff ID
											</div>
										</TableCell>
										<TableCell className="py-4 pr-6 font-medium font-mono text-base">
											{staff.id}
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Weekly Availability Table */}
					{staff.availability && (
						<Card className="border border-border/50 shadow-sm">
							<CardContent className="p-0">
								<div className="p-6 border-b border-border/50">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<Clock className="h-5 w-5 text-primary" />
										Weekly Schedule
									</h3>
									<p className="text-base text-muted-foreground mt-1">
										Working hours for each day of the week
									</p>
								</div>
								<Table>
									<TableHeader className="bg-muted/30">
										<TableRow>
											<TableHead className="font-medium">Day</TableHead>
											<TableHead className="font-medium">Availability</TableHead>
											<TableHead className="font-medium text-right">Hours</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{Object.entries(staff.availability).map(([day, hours]) => (
											<TableRow key={day} className="hover:bg-muted/20">
												<TableCell className="font-medium capitalize">
													{getDayName(day)}
												</TableCell>
												<TableCell>
													{hours[0] === "Closed" ? (
														<Badge
															variant="outline"
															className="bg-muted text-muted-foreground border-border"
														>
															<XCircle className="h-3 w-3 mr-1.5" />
															Closed
														</Badge>
													) : (
														<Badge
															variant="outline"
															className="bg-chart-3/10 text-chart-3 border-chart-3/30"
														>
															<CheckCircle className="h-3 w-3 mr-1.5" />
															Available
														</Badge>
													)}
												</TableCell>
												<TableCell className="text-right">
													<span className="font-medium">
														{hours[0] === "Closed" ? "—" : hours.join(", ")}
													</span>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}

					{/* Professional Details */}
					{(staff.specialization || staff.years_of_experience) && (
						<Card className="border border-border/50 shadow-sm">
							<CardContent className="p-0">
								<div className="p-6 border-b border-border/50">
									<h3 className="text-lg font-semibold flex items-center gap-2">
										<Briefcase className="h-5 w-5 text-primary" />
										Professional Details
									</h3>
								</div>
								<div className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{staff.specialization && (
											<div className="space-y-3">
												<div className="flex items-center gap-2 text-base text-muted-foreground">
													<BriefcaseMedical className="h-4 w-4" />
													<span>Specialization</span>
												</div>
												<div className="flex flex-wrap gap-2">
													{staff.specialization.split(",").map((spec, index) => (
														<Badge key={index} variant="secondary" className="px-3 py-1.5">
															{spec.trim()}
														</Badge>
													))}
												</div>
											</div>
										)}

										{staff.years_of_experience && (
											<div className="space-y-3">
												<div className="flex items-center gap-2 text-base text-muted-foreground">
													<Award className="h-4 w-4" />
													<span>Years of Experience</span>
												</div>
												<div className="flex items-center gap-3">
													<div className="text-3xl font-bold text-primary">
														{staff.years_of_experience}
													</div>
													<div className="text-base text-muted-foreground">
														years of professional experience
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							variant="outline"
							className="flex-1 gap-2 rounded-lg h-12"
							onClick={() => onOpenChange(false)}
						>
							Close Details
						</Button>
						{onDelete && (
							<Button
								variant="destructive"
								className="flex-1 gap-2 rounded-lg h-12"
								onClick={() => {
									onDelete(staff.id);
									onOpenChange(false);
								}}
							>
								<Trash2 className="h-4 w-4" />
								Remove Staff Member
							</Button>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
