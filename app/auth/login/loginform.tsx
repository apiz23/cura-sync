"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function LoginForm({ className }: React.ComponentProps<"div">) {
	const { isLoaded: isSignInLoaded, signIn } = useSignIn();
	const { isLoaded: userLoaded, isSignedIn } = useUser();
	const router = useRouter();
	const searchParams = useSearchParams();

	const nextPath = useMemo(() => {
		const raw = searchParams.get("next");
		if (!raw) return "/user/dashboard";
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
				redirectUrl: `${window.location.origin}/user/sso-callback`,
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
			<div className="flex flex-col items-center justify-center gap-3 py-20">
				<Loader2 className="h-5 w-5 animate-spin text-primary" />
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					Loading
				</p>
			</div>
		);
	}

	if (isSignedIn) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-20">
				<BrandLogo className="size-12 rounded-xl" />
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					Redirecting...
				</p>
				<Loader2 className="h-4 w-4 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<motion.div
			className={cn("flex flex-col", className)}
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.55, ease }}
		>
			{/* Mobile-only logo */}
			<motion.div
				className="mb-8 lg:hidden"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4, ease }}
			>
				<Link href="/" className="inline-flex items-center gap-2.5">
					<BrandLogo className="size-8 rounded-lg" />
					<span className="text-sm font-semibold tracking-tight text-foreground">
						CuraSync
					</span>
				</Link>
			</motion.div>

			{/* Heading */}
			<div className="mb-8">
				<motion.p
					className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.1, duration: 0.4 }}
				>
					Patient Portal
				</motion.p>
				<motion.h2
					className="text-[1.85rem] font-bold tracking-[-0.035em] text-foreground leading-tight"
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.13, ease }}
				>
					Welcome back.
				</motion.h2>
				<motion.p
					className="mt-2 text-[0.85rem] text-muted-foreground"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.22, duration: 0.4 }}
				>
					Sign in or create an account automatically.
				</motion.p>
			</div>

			{/* Actions */}
			<motion.div
				className="space-y-3"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.28, ease }}
			>
				<AnimatePresence mode="popLayout">
					{error && (
						<motion.div
							key="error"
							className="flex items-center gap-2 overflow-hidden rounded-lg border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive"
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.22, ease }}
						>
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				<motion.div
					whileTap={{ scale: 0.97 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				>
					<Button
						variant="outline"
						type="button"
						disabled={loadingStrategy !== null}
						onClick={() => void handleSocialAuth("oauth_google")}
						className={cn(
							"h-12 w-full rounded-xl border-border/70 text-[0.85rem] font-medium",
							"transition-all duration-200 hover:border-primary/35 hover:bg-primary/[0.04]",
							loadingStrategy && "cursor-not-allowed opacity-55",
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
				</motion.div>

				<div
					id="clerk-captcha"
					data-cl-theme="auto"
					data-cl-size="flexible"
					className="min-h-0"
				/>
			</motion.div>

			{/* Legal */}
			<motion.p
				className="mt-8 text-[0.72rem] text-muted-foreground"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.48, duration: 0.4 }}
			>
				By signing in, you agree to our{" "}
				<Link
					href="/terms"
					className="underline underline-offset-4 hover:text-foreground transition-colors duration-150"
				>
					Terms of Service
				</Link>{" "}
				and{" "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-foreground transition-colors duration-150"
				>
					Privacy Policy
				</Link>
				.
			</motion.p>

			<motion.p
				className="mt-3 text-[0.72rem] text-muted-foreground"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.54, duration: 0.4 }}
			>
				<Link
					href="/auth/admin"
					className="underline underline-offset-4 hover:text-foreground transition-colors duration-150"
				>
					Staff / Admin access →
				</Link>
			</motion.p>
		</motion.div>
	);
}
