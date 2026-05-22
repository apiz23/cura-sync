"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export function AdminLoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		router.prefetch("/admin/dashboard");
	}, [router]);

	async function waitForAdminSession() {
		for (let attempt = 0; attempt < 5; attempt += 1) {
			const res = await fetch("/api/staff/me", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
				cache: "no-store",
			});
			if (res.ok) return true;
			await new Promise((resolve) =>
				setTimeout(resolve, 150 * (attempt + 1)),
			);
		}
		return false;
	}

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		if (!email || !password) {
			toast.error("Please enter both email and password");
			return;
		}
		if (loading) return;

		setLoading(true);
		setError("");
		const loadingToast = toast.loading("Authenticating...");

		try {
			const res = await fetch("/api/auth/admin-login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Invalid credentials");

			const hasSession = await waitForAdminSession();
			if (!hasSession)
				throw new Error("Login succeeded but session was not ready");

			toast.success("Signed in successfully", { id: loadingToast });
			window.location.assign("/admin/dashboard");
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Login failed";
			setError(message);
			toast.error(message, { id: loadingToast });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden border shadow-sm">
				<CardHeader className="flex flex-col items-center gap-4 p-8 pb-6 text-center">
					<Link href="/" className="transition-opacity hover:opacity-80">
						<BrandLogo className="size-14 rounded-2xl shadow-md" />
					</Link>
					<div className="space-y-1.5">
						<CardTitle className="text-2xl font-bold tracking-tight">
							Admin Portal
						</CardTitle>
						<CardDescription>
							Secure access to system administration
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-8 pb-8">
					<form onSubmit={(e) => void handleLogin(e)}>
						<FieldGroup>
							{error && (
								<div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
									<AlertCircle className="h-4 w-4 shrink-0" />
									{error}
								</div>
							)}

							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									required
									placeholder="admin@curasync.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="h-11 rounded-xl"
									disabled={loading}
									autoComplete="email"
								/>
							</Field>

							<Field>
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										required
										placeholder="Enter your password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="h-11 rounded-xl pr-11"
										disabled={loading}
										autoComplete="current-password"
									/>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onClick={() => setShowPassword(!showPassword)}
										disabled={loading}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
								</div>
							</Field>

							<Button
								type="submit"
								disabled={loading}
								className="h-11 w-full rounded-xl font-semibold"
								size="lg"
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Authenticating...
									</>
								) : (
									<>
										<Lock className="mr-2 h-4 w-4" />
										Sign In
									</>
								)}
							</Button>

							<FieldSeparator />

							<div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<Shield className="h-4 w-4 text-primary" />
								</div>
								<FieldDescription className="text-xs leading-relaxed">
									Restricted to authorized administrators. All activities are
									logged and monitored for compliance.
								</FieldDescription>
							</div>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
