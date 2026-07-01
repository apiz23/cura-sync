import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "./loginform";

export const metadata: Metadata = {
	title: "Admin Sign In | CuraSync",
	description: "Secure admin access to CuraSync management system",
};

export default function AdminLoginPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
			{/* Dotted grid */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(color-mix(in oklch, var(--foreground) 7%, transparent) 1px, transparent 1px)",
					backgroundSize: "22px 22px",
				}}
			/>
			{/* Edge fades */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, var(--background) 100%)",
				}}
			/>

			<div className="relative z-10 w-full max-w-[400px]">
				<AdminLoginForm />
			</div>

			<p className="relative z-10 mt-8 font-mono text-[0.62rem] tracking-wide text-muted-foreground">
				<Link
					href="/auth/login"
					className="underline underline-offset-4 hover:text-foreground transition-colors"
				>
					Patient Sign-In
				</Link>
				{" · "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-foreground transition-colors"
				>
					Privacy
				</Link>
				{" · "}
				<Link
					href="/terms"
					className="underline underline-offset-4 hover:text-foreground transition-colors"
				>
					Terms
				</Link>
			</p>
		</div>
	);
}
