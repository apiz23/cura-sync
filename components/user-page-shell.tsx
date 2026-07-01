"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EASE, useMotionConfig } from "@/hooks/use-motion-config";

interface UserPageShellProps {
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
}

type UserPageHeaderAvatar = {
	src?: string | null;
	alt: string;
	fallback: string;
};

interface UserPageHeaderProps {
	title: string;
	description?: string;
	icon?: LucideIcon;
	sectionLabel?: string;
	avatar?: UserPageHeaderAvatar;
	actions?: React.ReactNode;
	meta?: React.ReactNode;
	align?: "left" | "center";
	className?: string;
}

export function UserPageShell({
	children,
	className,
	contentClassName,
}: UserPageShellProps) {
	return (
		<section className={cn("relative min-h-full bg-background", className)}>
			{/* Subtle dot grid */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					backgroundImage:
						"radial-gradient(color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)",
					backgroundSize: "22px 22px",
				}}
			/>
			{/* Radial fade — keeps dots from competing with content */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 80% 80% at 50% 30%, transparent 30%, var(--background) 80%)",
				}}
			/>
			<div
				className={cn(
					"relative z-10 flex w-full flex-col gap-6 px-4 py-6 md:px-8 md:py-8",
					contentClassName
				)}
			>
				{children}
			</div>
		</section>
	);
}

export function UserPageHeader({
	title,
	description,
	icon: Icon,
	sectionLabel,
	avatar,
	actions,
	meta,
	align = "left",
	className,
}: UserPageHeaderProps) {
	const { reduced } = useMotionConfig();
	const centered = align === "center";

	// Derive section label from icon name if not provided
	const label = sectionLabel;

	return (
		<div className={cn("pb-2", className)}>
			<div
				className={cn(
					"flex gap-5",
					centered
						? "flex-col items-center text-center"
						: "flex-col justify-between lg:flex-row lg:items-end"
				)}
			>
				<div className={cn("flex flex-col gap-2", centered && "items-center")}>
					{/* Section label — mono uppercase above title */}
					{label && (
						<motion.p
							className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
							initial={reduced ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3, ease: EASE }}
						>
							{label}
						</motion.p>
					)}

					<div
						className={cn(
							"flex items-center gap-3",
							centered && "justify-center"
						)}
					>
						{/* Avatar (dashboard only) */}
						{avatar && (
							<motion.div
								initial={reduced ? false : { opacity: 0, scale: 0.92 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.35, ease: EASE }}
							>
								<Avatar className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-border/50">
									{avatar.src ? (
										<AvatarImage src={avatar.src} alt={avatar.alt} />
									) : null}
									<AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
										{avatar.fallback}
									</AvatarFallback>
								</Avatar>
							</motion.div>
						)}

						{/* Icon fallback (no rounded box — inline before title) */}
						{!avatar && Icon && (
							<motion.div
								initial={reduced ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3, ease: EASE }}
							>
								<Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
							</motion.div>
						)}

						<motion.h1
							className="text-2xl font-bold tracking-tight text-foreground"
							initial={reduced ? false : { opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
						>
							{title}
						</motion.h1>
					</div>

					{description && (
						<motion.p
							className="max-w-2xl text-sm text-muted-foreground"
							initial={reduced ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.35, delay: 0.25, ease: EASE }}
						>
							{description}
						</motion.p>
					)}

					{meta && (
						<motion.div
							className={cn(
								"flex flex-wrap items-center gap-3 pt-1",
								centered && "justify-center"
							)}
							initial={reduced ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.38, ease: EASE }}
						>
							{meta}
						</motion.div>
					)}
				</div>

				{actions && (
					<motion.div
						className={cn(
							"flex shrink-0 flex-wrap gap-3",
							centered && "justify-center"
						)}
						initial={reduced ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.38, ease: EASE }}
					>
						{actions}
					</motion.div>
				)}
			</div>

			{/* Divider below header */}
			<div className="mt-5 h-px bg-border/50" />
		</div>
	);
}
