"use client";

import { useState, useEffect, useMemo } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	FieldDescription,
	FieldGroup,
	FieldSeparator,
} from "@/components/ui/field";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { isLoaded: isSignInLoaded, signIn } = useSignIn();
	const { isLoaded: userLoaded, isSignedIn } = useUser();
	const router = useRouter();
	const searchParams = useSearchParams();

	const nextPath = useMemo(() => {
		const raw = searchParams.get("next");
		if (!raw) return "/user/dashboard";
		// allow only same-origin relative paths
		if (!raw.startsWith("/") || raw.startsWith("//")) return "/user/dashboard";
		return raw;
	}, [searchParams]);

	const [error, setError] = useState("");
	const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (!hasMounted || !userLoaded) return;
		if (isSignedIn) {
			router.replace(nextPath);
		}
	}, [hasMounted, userLoaded, isSignedIn, router, nextPath]);

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
				redirectUrlComplete: nextPath,
			});
		} catch (err: unknown) {
			let message = `Failed to connect with ${providerName}`;
			if (
				typeof err === "object" &&
				err !== null &&
				"errors" in err &&
				Array.isArray((err as { errors?: { message?: string }[] }).errors)
			) {
				message =
					(err as { errors: { message?: string }[] }).errors[0]?.message ||
					message;
			} else if (err instanceof Error) {
				message = err.message;
			}
			setError(message);
			toast.error(message, { id: toastId, duration: 4000 });
			setLoadingStrategy(null);
		}
	};

	if (!hasMounted || !userLoaded) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (isSignedIn) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-16">
				<BrandLogo className="size-16 rounded-2xl shadow-lg" />
				<p className="text-sm text-muted-foreground">
					Redirecting to your dashboard...
				</p>
				<Loader2 className="h-5 w-5 animate-spin text-primary" />
			</div>
		);
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
							Welcome to CuraSync
						</CardTitle>
						<CardDescription>
							Sign in or create an account automatically
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-8 pb-8">
					<FieldGroup>
						{error && (
							<div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
								<AlertCircle className="h-4 w-4 shrink-0" />
								{error}
							</div>
						)}

						<Button
							variant="outline"
							type="button"
							disabled={loadingStrategy !== null}
							onClick={() => void handleSocialAuth("oauth_google")}
							className={cn(
								"h-11 w-full rounded-xl border transition-all duration-200",
								"hover:border-primary/30 hover:bg-primary/5",
								"active:scale-[0.98]",
								loadingStrategy && "cursor-not-allowed opacity-70",
							)}
						>
							{loadingStrategy === "oauth_google" ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Connecting...
								</>
							) : (
								<>
									<FcGoogle className="mr-2 h-5 w-5" />
									Continue with Google
								</>
							)}
						</Button>

						<div id="clerk-captcha" data-cl-theme="auto" data-cl-size="flexible" className="min-h-0" />
					</FieldGroup>
				</CardContent>
			</Card>

			<FieldDescription className="px-4 text-center">
				By signing in, you agree to our{" "}
				<Link href="/terms" className="underline underline-offset-4 hover:text-primary">
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
					Privacy Policy
				</Link>
				.
			</FieldDescription>
		</div>
	);
}
