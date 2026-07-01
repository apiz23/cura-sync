"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const features = [
	{
		num: "01",
		label: "Health Tracking",
		desc: "Sync vitals from wearables and IoT devices in real time.",
	},
	{
		num: "02",
		label: "Appointments",
		desc: "Book and manage clinic visits without phone calls.",
	},
	{
		num: "03",
		label: "AI Analysis",
		desc: "Describe symptoms and receive instant triage guidance.",
	},
];

export function AuthBrandPanel() {
	return (
		<div
			className="hidden lg:flex w-[52%] max-w-[640px] flex-col relative overflow-hidden"
			style={{ background: "oklch(0.16 0.05 267)" }}
		>
			{/* Fine grid texture */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage: [
						"linear-gradient(oklch(0.28 0.06 267 / 0.07) 1px, transparent 1px)",
						"linear-gradient(to right, oklch(0.28 0.06 267 / 0.07) 1px, transparent 1px)",
					].join(", "),
					backgroundSize: "56px 56px",
				}}
			/>
			{/* Radial glow */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 70% at 15% 60%, oklch(0.24 0.08 267 / 0.35) 0%, transparent 65%)",
				}}
			/>

			<div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease }}
				>
					<Link href="/" className="inline-flex items-center gap-3">
						<BrandLogo className="size-9 rounded-xl bg-white/[0.08] ring-1 ring-white/[0.12] shadow-none" />
						<span
							className="text-sm font-semibold tracking-tight"
							style={{ color: "oklch(0.92 0.01 267)" }}
						>
							CuraSync
						</span>
					</Link>
				</motion.div>

				{/* Main content */}
				<div className="mt-auto">
					<motion.p
						className="mb-5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]"
						style={{ color: "oklch(0.52 0.1 267)" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.18, ease }}
					>
						Healthcare Platform · Malaysia
					</motion.p>

					<motion.h1
						className="text-4xl font-bold xl:text-[2.75rem]"
						style={{
							color: "oklch(0.95 0.01 267)",
							fontFamily: "var(--font-serif)",
							lineHeight: 1.09,
							letterSpacing: "-0.03em",
						}}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, delay: 0.14, ease }}
					>
						Connecting patients with care they trust.
					</motion.h1>

					<motion.p
						className="mt-5 max-w-[36ch] text-[0.875rem] leading-relaxed"
						style={{ color: "oklch(0.62 0.05 267)" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.3, ease }}
					>
						AI-powered health management for clinics — appointment
						booking, vitals tracking, and intelligent symptom analysis.
					</motion.p>

					{/* Feature list */}
					<div className="mt-9 space-y-5">
						{features.map((f, i) => (
							<motion.div
								key={f.num}
								className="flex items-start gap-4"
								initial={{ opacity: 0, x: -12 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.45, delay: 0.38 + i * 0.09, ease }}
							>
								<span
									className="mt-0.5 shrink-0 font-mono text-[10px] font-bold tabular-nums"
									style={{ color: "oklch(0.5 0.1 267)" }}
								>
									{f.num}
								</span>
								<div>
									<p
										className="text-[0.82rem] font-semibold leading-snug"
										style={{ color: "oklch(0.88 0.02 267)" }}
									>
										{f.label}
									</p>
									<p
										className="mt-0.5 text-[0.75rem] leading-relaxed"
										style={{ color: "oklch(0.44 0.03 267)" }}
									>
										{f.desc}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>

				{/* Footer */}
				<motion.p
					className="mt-12 font-mono text-[0.6rem] uppercase tracking-widest"
					style={{ color: "oklch(0.36 0.03 267)" }}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.4, delay: 0.7, ease }}
				>
					© {new Date().getFullYear()} CuraSync
				</motion.p>
			</div>
		</div>
	);
}
