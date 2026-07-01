"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AdminLoginForm({ className }: React.ComponentProps<"div">) {
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
		<motion.div
			className={cn("flex flex-col", className)}
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease }}
		>
			{/* System label */}
			<motion.p
				className="mb-6 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.08, duration: 0.4 }}
			>
				CuraSync · System Administration
			</motion.p>

			{/* Heading */}
			<motion.div
				className="mb-7"
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.12, duration: 0.5, ease }}
			>
				<h1 className="text-[1.6rem] font-bold tracking-[-0.03em] text-foreground leading-tight">
					Administrator Sign In
				</h1>
				<p className="mt-1.5 text-[0.82rem] text-muted-foreground">
					Restricted to authorized system administrators.
				</p>
			</motion.div>

			{/* Form card */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.4 }}
			>
				<form onSubmit={(e) => void handleLogin(e)}>
					<div className="rounded-xl border border-border bg-card">
						<div className="px-6 py-6">
							<div className="space-y-5">
								<AnimatePresence mode="popLayout">
									{error && (
										<motion.div
											key="error"
											className="flex items-start gap-2.5 overflow-hidden rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2, ease }}
										>
											<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
											<span>{error}</span>
										</motion.div>
									)}
								</AnimatePresence>

								<div>
									<label
										htmlFor="email"
										className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
									>
										Email Address
									</label>
									<Input
										id="email"
										type="email"
										required
										placeholder="admin@curasync.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="h-10 rounded-lg text-sm"
										disabled={loading}
										autoComplete="email"
									/>
								</div>

								<div>
									<label
										htmlFor="password"
										className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"
									>
										Password
									</label>
									<div className="relative">
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											required
											placeholder="Enter your password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="h-10 rounded-lg pr-10 text-sm"
											disabled={loading}
											autoComplete="current-password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
											onClick={() => setShowPassword(!showPassword)}
											disabled={loading}
											aria-label={
												showPassword ? "Hide password" : "Show password"
											}
										>
											{showPassword ? (
												<EyeOff className="h-3.5 w-3.5" />
											) : (
												<Eye className="h-3.5 w-3.5" />
											)}
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className="border-t border-border px-6 py-4">
							<p className="font-mono text-[0.62rem] leading-relaxed tracking-wide text-muted-foreground">
								All access is logged and audited. Unauthorized use is prohibited.
							</p>
						</div>
					</div>

					<motion.div
						className="mt-3"
						whileTap={{ scale: 0.97 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
					>
						<Button
							type="submit"
							disabled={loading}
							className="h-11 w-full rounded-xl text-sm font-semibold"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Authenticating...
								</>
							) : (
								<>
									<Lock className="mr-2 h-3.5 w-3.5" />
									Sign In
								</>
							)}
						</Button>
					</motion.div>
				</form>
			</motion.div>
		</motion.div>
	);
}
