"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Stethoscope, Shield, Activity, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { isLoaded: isSignInLoaded, signIn } = useSignIn();
	const { isLoaded: userLoaded, isSignedIn } = useUser();
	const router = useRouter();

	const [error, setError] = useState("");
	const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
	const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (!hasMounted || !userLoaded) return;

		if (isSignedIn) {
			router.replace("/user/dashboard");
		}
	}, [hasMounted, userLoaded, isSignedIn, router]);

	const handleSocialAuth = async (
		strategy: "oauth_google" | "oauth_facebook",
	) => {
		if (!isSignInLoaded) return;

		setError("");
		setLoadingStrategy(strategy);

		const providerName = strategy === "oauth_google" ? "Google" : "Facebook";
		const toastId = `social-auth-${strategy}`;

		try {
			toast.loading(`Connecting to ${providerName}...`, {
				id: toastId,
				duration: 10000,
			});
			await signIn.authenticateWithRedirect({
				strategy: strategy,
				redirectUrl: "/user/sso-callback",
				redirectUrlComplete: "/user/dashboard",
			});
		} catch (err: unknown) {
			console.error(`${providerName} Auth Error:`, err);

			let message = `Failed to connect with ${providerName}`;

			if (
				typeof err === "object" &&
				err !== null &&
				"errors" in err &&
				Array.isArray((err as { errors?: { message?: string }[] }).errors)
			) {
				message =
					(err as { errors: { message?: string }[] }).errors[0]?.message || message;
			} else if (err instanceof Error) {
				message = err.message;
			}

			setError(message);

			// Show error toast
			toast.error(message, {
				id: toastId,
				duration: 4000,
			});

			setLoadingStrategy(null);
		}
	};

	// Show loading state while checking authentication
	if (!hasMounted || !userLoaded) {
		return (
			<Card className="border-0 shadow-none bg-transparent">
				<CardContent className="p-0">
					<div className="flex flex-col items-center justify-center gap-6 py-12">
						<Loader2 className="size-12 animate-spin text-primary" />
						<p className="text-muted-foreground">Loading authentication...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Don't show the form if already signed in
	if (isSignedIn) {
		return (
			<Card className="border-0 shadow-none bg-transparent">
				<CardContent className="p-0">
					<div className="flex flex-col items-center justify-center gap-6 py-12">
						<div className="relative">
							<BrandLogo className="size-20 rounded-2xl shadow-lg animate-pulse" />
						</div>
						<div className="text-center space-y-2">
							<h1 className="text-2xl font-bold">Welcome back!</h1>
							<p className="text-muted-foreground">Redirecting to your dashboard...</p>
						</div>
						<Loader2 className="size-6 animate-spin text-primary" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-0 shadow-none bg-transparent">
			<CardContent className="p-0">
				<div className={cn("flex flex-col gap-8", className)} {...props}>
					<div className="flex flex-col items-center gap-6 text-center">
						<div className="relative">
							<BrandLogo className="size-20 rounded-2xl shadow-lg" />
						</div>

						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tight">
								Welcome to CuraSync
							</h1>
							<p className="text-muted-foreground">
								Sign in or create an account automatically
							</p>
						</div>
					</div>

					{/* Features Highlight */}
					<div className="grid grid-cols-3 gap-3">
						{[
							{
								icon: Shield,
								label: "Secure",
								color: "text-blue-500",
								bg: "bg-blue-50 dark:bg-blue-950/20",
							},
							{
								icon: Activity,
								label: "Efficient",
								color: "text-emerald-500",
								bg: "bg-emerald-50 dark:bg-emerald-950/20",
							},
							{
								icon: Stethoscope,
								label: "Care",
								color: "text-indigo-500",
								bg: "bg-indigo-50 dark:bg-indigo-950/20",
							},
						].map((feature) => (
							<div
								key={feature.label}
								className={cn(
									"flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 hover:shadow-sm",
									feature.bg,
								)}
							>
								<feature.icon className={cn("size-5", feature.color)} />
								<span className="text-sm font-medium">{feature.label}</span>
							</div>
						))}
					</div>

					{/* Error Message */}
					{error && (
						<div className="animate-in slide-in-from-top duration-300">
							<div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl text-center font-medium flex items-center justify-center gap-2">
								<div className="size-2 bg-destructive rounded-full animate-pulse" />
								{error}
							</div>
						</div>
					)}

					{/* Main Auth Section */}
					<div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
						{/* Google Button */}
						<Button
							variant="outline"
							type="button"
							disabled={loadingStrategy !== null}
							onClick={() => handleSocialAuth("oauth_google")}
							onMouseEnter={() => setHoveredStrategy("google")}
							onMouseLeave={() => setHoveredStrategy(null)}
							className={cn(
								"h-12 w-full rounded-xl border-2 transition-all duration-300 relative overflow-hidden",
								"hover:border-red-200 hover:bg-red-50/50 hover:shadow-md dark:hover:bg-red-950/10 dark:hover:border-red-900/50",
								"active:scale-[0.98]",
								loadingStrategy && "opacity-70 cursor-not-allowed",
							)}
						>
							{loadingStrategy === "oauth_google" ? (
								<div className="flex items-center justify-center gap-3">
									<Loader2 className="size-5 animate-spin text-red-500" />
									<span className="font-semibold">Connecting...</span>
								</div>
							) : (
								<div className="flex items-center justify-center gap-3">
									<div className="relative">
										<FcGoogle className="size-6" />
										{hoveredStrategy === "google" && (
											<div className="absolute -inset-2 bg-red-500/10 rounded-full animate-ping" />
										)}
									</div>
									<span className="font-semibold">Continue with Google</span>
								</div>
							)}
						</Button>

						{/* Facebook Button */}
						{/* <Button
							variant="outline"
							type="button"
							disabled={loadingStrategy !== null}
							onClick={() => handleSocialAuth("oauth_facebook")}
							onMouseEnter={() => setHoveredStrategy("facebook")}
							onMouseLeave={() => setHoveredStrategy(null)}
							className={cn(
								"h-12 w-full rounded-xl border-2 transition-all duration-300 relative overflow-hidden",
								"hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md dark:hover:bg-blue-950/10 dark:hover:border-blue-900/50",
								"active:scale-[0.98]",
								loadingStrategy && "opacity-70 cursor-not-allowed",
							)}
						>
							{loadingStrategy === "oauth_facebook" ? (
								<div className="flex items-center justify-center gap-3">
									<Loader2 className="size-5 animate-spin text-[#1877F2]" />
									<span className="font-semibold">Connecting...</span>
								</div>
							) : (
								<div className="flex items-center justify-center gap-3">
									<div className="relative">
										<FaFacebook className="size-6 text-[#1877F2]" />
										{hoveredStrategy === "facebook" && (
											<div className="absolute -inset-2 bg-blue-500/10 rounded-full animate-ping" />
										)}
									</div>
									<span className="font-semibold">Continue with Facebook</span>
								</div>
							)}
						</Button> */}

						<div
							id="clerk-captcha"
							data-cl-theme="auto"
							data-cl-size="flexible"
							className="min-h-0"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
