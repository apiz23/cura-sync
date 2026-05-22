import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "./loginform";

export const metadata: Metadata = {
	title: "Admin Sign In | CuraSync",
	description: "Secure admin access to CuraSync management system",
};

export default function AdminLoginPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-linear-to-br from-primary/[0.06] via-background to-muted/20 p-6 md:p-10">
			{/* ── Background layer ─────────────────────────────────────────── */}
			<div aria-hidden="true" className="pointer-events-none absolute inset-0">
				{/* Major (80px) + minor (20px) primary-tinted grid */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: [
							"linear-gradient(color-mix(in oklch, var(--primary) 9%, transparent) 1px, transparent 1px)",
							"linear-gradient(to right, color-mix(in oklch, var(--primary) 9%, transparent) 1px, transparent 1px)",
							"linear-gradient(color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px)",
							"linear-gradient(to right, color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px)",
						].join(", "),
						backgroundSize: "80px 80px, 80px 80px, 20px 20px, 20px 20px",
					}}
				/>
				{/* Diagonal stripe overlay */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent, transparent 40px, color-mix(in oklch, var(--primary) 3%, transparent) 40px, color-mix(in oklch, var(--primary) 3%, transparent) 41px)",
					}}
				/>
				{/* Top-fade vignette */}
				<div className="absolute inset-0 bg-linear-to-b from-primary/[0.06] via-transparent to-transparent" />
				{/* Corner accent borders */}
				<div className="absolute left-0 top-0 h-48 w-48 border-l border-t border-primary/20" />
				<div className="absolute bottom-0 right-0 h-48 w-48 border-b border-r border-primary/20" />
				{/* Watermark */}
				<div
					className="absolute left-4 top-6 hidden select-none text-[18rem] font-black leading-none tracking-[-0.08em] text-primary/[0.04] lg:block"
					style={{
						WebkitTextStroke:
							"1px color-mix(in oklch, var(--primary) 12%, transparent)",
					}}
				>
					ADM
				</div>
			</div>

			{/* ── Content ──────────────────────────────────────────────────── */}
			<div className="relative z-50 w-full max-w-sm">
				<AdminLoginForm />
			</div>
			<p className="relative z-10 text-center text-xs text-muted-foreground">
				<Link
					href="/auth/login"
					className="underline underline-offset-4 hover:text-foreground"
				>
					Patient sign-in
				</Link>
				{" · "}
				<Link
					href="/privacy"
					className="underline underline-offset-4 hover:text-foreground"
				>
					Privacy
				</Link>
				{" · "}
				<Link
					href="/terms"
					className="underline underline-offset-4 hover:text-foreground"
				>
					Terms
				</Link>
			</p>
		</div>
	);
}
