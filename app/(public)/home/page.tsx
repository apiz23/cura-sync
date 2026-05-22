"use client";

import {
	motion,
	useMotionValue,
	useSpring,
	useScroll,
	useTransform,
	useInView,
	animate,
	type Variants,
} from "framer-motion";
import Link from "next/link";
import {
	useEffect,
	useRef,
	useState,
	useCallback,
	type CSSProperties,
} from "react";
import {
	PiBrain,
	PiLockKey,
	PiWaveform,
	PiUsers,
	PiCalendar,
	PiClipboardText,
	PiShieldCheck,
	PiArrowRight,
	PiCheckCircle,
	PiHeartbeat,
	PiArrowUpRight,
	PiSparkleFill,
	PiDatabase,
	PiDeviceMobile,
} from "react-icons/pi";
import { cn } from "@/lib/utils";
import PageTitle from "@/components/page-title";

// ── Data ────────────────────────────────────────────────────────────────────

const typewriterPhrases = [
	"BioClinicalBERT parses your symptoms in real time.",
	"Polygon blockchain secures every record access.",
	"Apple Watch, Fitbit, and Garmin sync automatically.",
	"PDPA-compliant. Built for Malaysian healthcare.",
];

const marqueeItems = [
	{ label: "BioClinicalBERT", Icon: PiBrain },
	{ label: "Polygon Network", Icon: PiDatabase },
	{ label: "JamAIBase RAG", Icon: PiSparkleFill },
	{ label: "Apple Health", Icon: PiHeartbeat },
	{ label: "Fitbit", Icon: PiWaveform },
	{ label: "IPFS Storage", Icon: PiLockKey },
	{ label: "Supabase", Icon: PiDatabase },
	{ label: "Clerk Auth", Icon: PiShieldCheck },
	{ label: "Next.js 16", Icon: PiArrowUpRight },
	{ label: "TypeScript", Icon: PiSparkleFill },
	{ label: "Garmin Connect", Icon: PiWaveform },
	{ label: "Samsung Health", Icon: PiDeviceMobile },
];

const techPillars = [
	{
		icon: PiBrain,
		name: "Artificial Intelligence",
		number: "01",
		badges: ["BioClinicalBERT", "JamAIBase RAG"],
		description:
			"BioClinicalBERT — trained on clinical EHR text — extracts medical entities from natural language. JamAIBase provides retrieval-augmented responses grounded in a verified knowledge base, reducing hallucination in AI outputs.",
	},
	{
		icon: PiLockKey,
		name: "Blockchain Security",
		number: "02",
		badges: ["Polygon Network", "Solidity", "IPFS"],
		description:
			"Medical records are hashed on Polygon Layer 2 smart contracts. Encrypted files are stored on IPFS. Every access event — provider identity, timestamp, patient consent — is logged immutably on-chain.",
	},
	{
		icon: PiWaveform,
		name: "IoT Health Tracking",
		number: "03",
		badges: ["Apple Watch", "Fitbit", "Garmin", "Samsung"],
		description:
			"Continuous monitoring of heart rate variability, ECG, blood oxygen, blood pressure, sleep patterns, and activity levels. Automated threshold alerts notify patients, caregivers, and designated providers.",
	},
];

const modules = [
	{
		icon: PiUsers,
		number: "01",
		title: "User Management",
		roles: "Patient · Doctor · Caregiver · Public",
		description:
			"Role-based access for four user categories. Doctors complete credential verification. Caregivers manage dependent health profiles with explicit patient consent.",
		span: "lg:col-span-7",
		accent: "#EDF3EC",
		accentDark: "#1a2e1a",
	},
	{
		icon: PiBrain,
		number: "02",
		title: "AI Symptom Analysis",
		roles: "Patient · Public",
		description:
			"BioClinicalBERT parses symptom descriptions into structured clinical entities. Multi-modal input accommodates different health literacy levels.",
		span: "lg:col-span-5",
		accent: "#E1F3FE",
		accentDark: "#0a1e2e",
	},
	{
		icon: PiCalendar,
		number: "03",
		title: "Appointment & Scheduling",
		roles: "Patient · Doctor",
		description:
			"Patients select from available schedule slots. Staff manage booking, check-in, and queue flow in one view with direct symptom-analysis context.",
		span: "lg:col-span-5",
		accent: "#FBF3DB",
		accentDark: "#2e2410",
	},
	{
		icon: PiClipboardText,
		number: "04",
		title: "Health Record Management",
		roles: "Patient · Doctor",
		description:
			"Diagnostic reports, clinical notes, prescriptions, and immunization records — stored with IPFS encryption and Polygon hash verification.",
		span: "lg:col-span-7",
		accent: "#FDEBEC",
		accentDark: "#2e1010",
	},
	{
		icon: PiShieldCheck,
		number: "05",
		title: "Blockchain Audit",
		roles: "System backend",
		description:
			"Every record access and consent change is cryptographically logged on Polygon. Immutable audit trails support PDPA compliance.",
		span: "lg:col-span-6",
		accent: "#EDF3EC",
		accentDark: "#1a2e1a",
	},
	{
		icon: PiHeartbeat,
		number: "06",
		title: "IoT Health Tracking",
		roles: "Patient · Caregiver",
		description:
			"Wearable integration tracks clinical indicators continuously. Caregivers receive push alerts when vitals cross configured thresholds.",
		span: "lg:col-span-6",
		accent: "#E1F3FE",
		accentDark: "#0a1e2e",
	},
];

const workflowSteps = [
	{
		number: "01",
		title: "Register and choose your role",
		description:
			"Patients, caregivers, and public users sign up directly. Healthcare professionals complete credential verification before accessing patient records.",
		href: "/facilities",
		cta: "Browse facilities",
	},
	{
		number: "02",
		title: "Analyze, book, and track",
		description:
			"Run a BioClinicalBERT symptom analysis before a visit. Book a timeslot at a registered facility. Wearable data syncs automatically throughout the care journey.",
		href: "/symptom-analyzer",
		cta: "Try symptom analyzer",
	},
	{
		number: "03",
		title: "Secured records, continuous care",
		description:
			"Every consultation note, medication entry, and health metric stays attached to the blockchain-verified record. Providers access complete history for better decisions.",
		href: "/",
		cta: "Learn about records",
	},
];

// ── Animation Components ──────────────────────────────────────────────────────

function BlurIn({
	children,
	delay = 0,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.2 });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
			animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
			transition={{ duration: 0.55, delay, ease: [0.25, 0.4, 0.55, 1] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

function AnimatedCounter({
	value,
	suffix = "",
}: {
	value: number;
	suffix?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const isInView = useInView(ref, { once: true });
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!isInView) return;
		const controls = animate(0, value, {
			duration: 1.4,
			ease: [0.25, 0.4, 0.55, 1],
			onUpdate: (v) => setCount(Math.round(v)),
		});
		return controls.stop;
	}, [isInView, value]);

	return (
		<span ref={ref}>
			{count}
			{suffix}
		</span>
	);
}

// ── Isolated Motion Components ────────────────────────────────────────────────

function TypewriterText() {
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [displayText, setDisplayText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const phrase = typewriterPhrases[phraseIndex];
		let timeout: ReturnType<typeof setTimeout>;

		if (!isDeleting && displayText.length < phrase.length) {
			timeout = setTimeout(() => {
				setDisplayText(phrase.slice(0, displayText.length + 1));
			}, 32);
		} else if (!isDeleting && displayText.length === phrase.length) {
			timeout = setTimeout(() => setIsDeleting(true), 2600);
		} else if (isDeleting && displayText.length > 0) {
			timeout = setTimeout(() => {
				setDisplayText(phrase.slice(0, displayText.length - 1));
			}, 16);
		} else {
			setIsDeleting(false);
			setPhraseIndex((i) => (i + 1) % typewriterPhrases.length);
		}

		return () => clearTimeout(timeout);
	}, [displayText, isDeleting, phraseIndex]);

	return (
		<span className="text-foreground">
			{displayText}
			<motion.span
				animate={{ opacity: [1, 0, 1] }}
				transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
				className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[2px] rounded-sm bg-primary"
			/>
		</span>
	);
}

function MagneticCta({
	href,
	children,
	className,
	variant = "primary",
}: {
	href: string;
	children: React.ReactNode;
	className?: string;
	variant?: "primary" | "ghost";
}) {
	const ref = useRef<HTMLDivElement>(null);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const xSpring = useSpring(x, { stiffness: 200, damping: 20, mass: 0.1 });
	const ySpring = useSpring(y, { stiffness: 200, damping: 20, mass: 0.1 });

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			x.set((e.clientX - rect.left - rect.width / 2) * 0.28);
			y.set((e.clientY - rect.top - rect.height / 2) * 0.28);
		},
		[x, y],
	);

	const handleMouseLeave = useCallback(() => {
		x.set(0);
		y.set(0);
	}, [x, y]);

	return (
		<motion.div
			ref={ref}
			style={{ x: xSpring, y: ySpring }}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			whileTap={{ scale: 0.97 }}
			className="inline-block"
		>
			<Link
				href={href}
				className={cn(
					"inline-flex h-11 items-center gap-2 rounded-xl px-7 text-[15px] font-semibold transition-colors duration-150",
					variant === "primary" &&
						"bg-foreground text-background hover:bg-foreground/90 dark:bg-foreground dark:text-background",
					variant === "ghost" &&
						"border border-border bg-transparent text-foreground hover:bg-muted",
					className,
				)}
			>
				{children}
			</Link>
		</motion.div>
	);
}

function BentoHoverCard({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			animate={
				isHovered
					? { y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.08)" }
					: { y: 0, boxShadow: "0 0px 0px 0px rgba(0,0,0,0)" }
			}
			transition={{ type: "spring", stiffness: 300, damping: 25 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// ── Variants ─────────────────────────────────────────────────────────────────

const staggerContainer: Variants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.09, delayChildren: 0.05 },
	},
};

const fadeBlurUp: Variants = {
	hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { type: "spring", stiffness: 70, damping: 20 },
	},
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
	const heroRef = useRef<HTMLElement>(null);
	const { scrollYProgress: heroScroll } = useScroll({
		target: heroRef,
		offset: ["start start", "end start"],
	});
	const blobY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
	const blobOpacity = useTransform(heroScroll, [0, 0.7], [0.025, 0]);

	return (
		<main className="relative min-h-[100dvh] bg-background">
			<PageTitle title="Home" />

			{/* Ambient gradient blob — scroll-linked parallax */}
			<div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
				<motion.div
					style={{ y: blobY, opacity: blobOpacity }}
					className="absolute -right-40 -top-40 h-[700px] w-[700px] rounded-full"
				>
					<motion.div
						animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
						transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
						className="h-full w-full rounded-full"
						style={{
							background:
								"radial-gradient(circle, var(--primary) 0%, transparent 70%)",
						}}
					/>
				</motion.div>
			</div>

			{/* ── HERO ─────────────────────────────────────────────────────── */}
			<section
				ref={heroRef}
				className="relative overflow-hidden px-6 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24"
			>
				{/* Hero grid background */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px)",
						backgroundSize: "72px 72px",
					}}
				/>
				{/* Diagonal stripe overlay */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent, transparent 40px, color-mix(in oklch, var(--primary) 3%, transparent) 40px, color-mix(in oklch, var(--primary) 3%, transparent) 41px)",
					}}
				/>
				{/* Right-side gradient fade */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40vw] bg-gradient-to-l from-primary/[0.06] to-transparent lg:block"
				/>
				{/* Watermark */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-4 top-8 hidden select-none text-[10rem] font-black leading-none tracking-[-0.06em] text-primary/[0.04] xl:block"
				>
					CARE
				</div>
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 gap-16 lg:grid-cols-[55fr_45fr] lg:items-center lg:gap-12">
						{/* Left — content */}
						<motion.div
							variants={staggerContainer}
							initial="hidden"
							animate="visible"
						>
							<motion.div variants={fadeBlurUp} className="mb-7">
								<span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 font-mono text-xs font-medium text-muted-foreground">
									<PiSparkleFill className="h-3 w-3 text-primary" />
									Smart Care Platform
								</span>
							</motion.div>

							<motion.h1
								variants={fadeBlurUp}
								className="font-display text-5xl font-black tracking-tight text-foreground sm:text-6xl lg:text-[4.5rem] lg:leading-[1.06]"
							>
								Smarter intake.
								<br />
								Better coordination.
								<br />
								<span className="text-primary sm:text-6xl lg:text-[4.5rem] lg:leading-[1.06]">Connected care.</span>
							</motion.h1>

							<motion.p
								variants={fadeBlurUp}
								className="mt-7 h-7 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground"
							>
								<TypewriterText />
							</motion.p>

							<motion.p
								variants={fadeBlurUp}
								className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground"
							>
								CuraSync unifies symptom intake, appointments, medication tracking,
								blockchain-secured records, and IoT health monitoring for patients,
								doctors, and caregivers.
							</motion.p>

							<motion.div variants={fadeBlurUp} className="mt-9 flex flex-wrap gap-3">
								<MagneticCta href="/facilities" variant="primary">
									Explore facilities
									<PiArrowRight className="h-4 w-4" />
								</MagneticCta>
								<MagneticCta href="/symptom-analyzer" variant="ghost">
									Try symptom analyzer
								</MagneticCta>
							</motion.div>

							<motion.div
								variants={fadeBlurUp}
								className="mt-12 border-t border-border pt-8"
							>
								<div className="grid grid-cols-4 gap-6 sm:gap-10">
									{[
										{ value: 6, label: "Core modules" },
										{ value: 4, label: "User roles" },
										{ value: 3, label: "Tech layers" },
										{ value: 1, label: "Pilot clinic" },
									].map((s) => (
										<div key={s.label}>
											<p className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">
												<AnimatedCounter value={s.value} />
											</p>
											<p className="mt-1 text-xs font-medium text-muted-foreground">
												{s.label}
											</p>
										</div>
									))}
								</div>
							</motion.div>
						</motion.div>

						{/* Right — animated preview cards */}
						<motion.div
							initial={{ opacity: 0, x: 24, filter: "blur(12px)" }}
							animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
							transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
							className="flex flex-col gap-3 lg:pl-4"
						>
							{/* Symptom Analysis Card */}
							<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
								<div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-2.5">
									<span className="h-2.5 w-2.5 rounded-full bg-border" />
									<span className="h-2.5 w-2.5 rounded-full bg-border" />
									<span className="h-2.5 w-2.5 rounded-full bg-border" />
									<span className="ml-2 font-mono text-[11px] text-muted-foreground">
										CuraSync · Symptom Analysis
									</span>
								</div>
								<div className="p-4">
									<p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
										Patient input
									</p>
									<p className="mt-1.5 text-sm text-foreground">
										"Persistent headache, fatigue, mild fever — 3 days"
									</p>
									<div className="mt-4 space-y-3">
										{[
											{ label: "Upper respiratory infection", score: 74 },
											{ label: "Tension-type headache", score: 52 },
										].map((item) => (
											<div key={item.label}>
												<div className="flex justify-between text-xs">
													<span className="font-medium text-foreground">{item.label}</span>
													<span className="font-mono tabular-nums text-muted-foreground">
														{item.score}%
													</span>
												</div>
												<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${item.score}%` }}
														transition={{
															type: "spring",
															stiffness: 60,
															damping: 20,
															delay: 0.6,
														}}
														className="h-full rounded-full bg-primary"
													/>
												</div>
											</div>
										))}
									</div>
									<div className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#EDF3EC] px-3 py-2 dark:bg-[#1a2e1a]">
										<PiCheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
										<p className="text-xs font-medium text-primary">
											Consultation recommended — book an appointment
										</p>
									</div>
								</div>
							</div>

							{/* Health Sync + Audit row */}
							<div className="grid grid-cols-2 gap-3">
								{/* Health Sync */}
								<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
									<div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
										<span className="h-2 w-2 rounded-full bg-border" />
										<span className="h-2 w-2 rounded-full bg-border" />
										<span className="h-2 w-2 rounded-full bg-border" />
									</div>
									<div className="p-3">
										<div className="flex items-center justify-between">
											<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
												Health Sync
											</p>
											<span className="flex items-center gap-1">
												<motion.span
													animate={{ opacity: [1, 0.2, 1] }}
													transition={{ duration: 1.8, repeat: Infinity }}
													className="h-1.5 w-1.5 rounded-full bg-primary"
												/>
												<span className="font-mono text-[10px] text-muted-foreground">
													live
												</span>
											</span>
										</div>
										<div className="mt-3 space-y-2">
											{[
												{ l: "Heart rate", v: "78 bpm" },
												{ l: "Blood O₂", v: "98%" },
												{ l: "Steps", v: "4,280" },
											].map((m) => (
												<div key={m.l} className="flex justify-between">
													<span className="text-[11px] text-muted-foreground">{m.l}</span>
													<span className="font-mono text-[11px] font-medium text-foreground">
														{m.v}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>

								{/* Audit trail */}
								<div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-lg">
									<div>
										<p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
											Audit trail
										</p>
										<div className="mt-3 space-y-2">
											{[
												"MED-2048 · Read by Dr. Aiman",
												"REC-7123 · Updated",
												"APT-9041 · Confirmed",
											].map((entry) => (
												<p
													key={entry}
													className="truncate font-mono text-[10px] text-muted-foreground"
												>
													{entry}
												</p>
											))}
										</div>
									</div>
									<div className="mt-3 flex items-center gap-1.5">
										<PiShieldCheck className="h-3.5 w-3.5 text-primary" />
										<p className="text-[10px] font-medium text-primary">
											Polygon-verified
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* ── MARQUEE ──────────────────────────────────────────────────── */}
			<div className="border-y border-border bg-muted/30 py-4">
				<div className="overflow-hidden">
					<motion.div
						animate={{ x: ["0%", "-50%"] }}
						transition={{ duration: 28, ease: "linear", repeat: Infinity }}
						className="flex w-max gap-0"
					>
						{[...marqueeItems, ...marqueeItems].map((item, i) => {
							const Icon = item.Icon;
							return (
								<div
									key={i}
									className="flex items-center gap-2 whitespace-nowrap border-r border-border px-8 py-1"
								>
									<Icon className="h-3.5 w-3.5 text-primary" />
									<span className="font-mono text-xs font-medium text-muted-foreground">
										{item.label}
									</span>
								</div>
							);
						})}
					</motion.div>
				</div>
			</div>

			{/* ── TECH PILLARS ─────────────────────────────────────────────── */}
			<section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32">
				{/* Dot grid */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"radial-gradient(color-mix(in oklch, var(--primary) 14%, transparent) 1px, transparent 1px)",
						backgroundSize: "36px 36px",
					}}
				/>
				{/* Left gradient fade */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-0 w-[30vw] bg-gradient-to-r from-background to-transparent"
				/>
				{/* Right gradient fade */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 right-0 w-[30vw] bg-gradient-to-l from-background to-transparent"
				/>
				{/* Top + bottom fade */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
				/>
				<div className="mx-auto max-w-7xl">
					<BlurIn className="mb-16">
						<span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
							Three technology layers
						</span>
						<h2 className="font-display mt-4 max-w-[38ch] text-4xl font-bold tracking-tight text-foreground">
							AI, blockchain, and IoT — working together, not in isolation.
						</h2>
					</BlurIn>

					<div className="divide-y divide-border">
						{techPillars.map((pillar, i) => {
							const Icon = pillar.icon;
							return (
								<BlurIn
									key={pillar.name}
									delay={i * 0.05}
									className="grid grid-cols-1 gap-8 py-12 md:grid-cols-[300px_1fr] md:gap-16"
								>
									<div>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
												<Icon className="h-5 w-5 text-primary" />
											</div>
											<span className="font-mono text-xs text-muted-foreground">
												Layer {pillar.number}
											</span>
										</div>
										<h3 className="font-display mt-4 text-xl font-semibold text-foreground">
											{pillar.name}
										</h3>
										<div className="mt-3 flex flex-wrap gap-1.5">
											{pillar.badges.map((b) => (
												<span
													key={b}
													className="rounded-full border border-border bg-muted px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
												>
													{b}
												</span>
											))}
										</div>
									</div>
									<p className="self-center text-[15px] leading-relaxed text-muted-foreground md:max-w-[60ch]">
										{pillar.description}
									</p>
								</BlurIn>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── BENTO MODULES ────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-t border-border bg-muted/20 px-6 py-24 dark:bg-muted/10 lg:px-10 lg:py-32">
				{/* Small square grid */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in oklch, var(--primary) 4%, transparent) 1px, transparent 1px)",
						backgroundSize: "48px 48px",
					}}
				/>
				{/* Top-right radial glow */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-30"
					style={{
						background:
							"radial-gradient(circle, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)",
					}}
				/>
				{/* Bottom-left radial glow */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-20"
					style={{
						background:
							"radial-gradient(circle, color-mix(in oklch, var(--primary) 10%, transparent) 0%, transparent 70%)",
					}}
				/>
				<div className="mx-auto max-w-7xl">
					<BlurIn className="mb-16">
						<span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
							Platform modules
						</span>
						<h2 className="font-display mt-4 max-w-[36ch] text-4xl font-bold tracking-tight text-foreground">
							Six integrated modules. One connected care journey.
						</h2>
					</BlurIn>

					{/* Asymmetric bento: 7+5 / 5+7 / 6+6 */}
					<div className="grid gap-4 lg:grid-cols-12">
						{modules.map((mod, i) => {
							const Icon = mod.icon;
							return (
								<BentoHoverCard
									key={mod.number}
									className={cn(
										"flex flex-col rounded-3xl border border-border bg-card p-8",
										mod.span,
									)}
								>
									<BlurIn delay={(i % 3) * 0.07}>
										<div className="flex items-start justify-between">
											<div
												className="flex h-11 w-11 items-center justify-center rounded-xl text-primary"
												style={
													{
														"--module-accent": mod.accent,
														"--module-accent-dark": mod.accentDark,
													} as CSSProperties
												}
											>
												<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--module-accent)] dark:bg-[var(--module-accent-dark)]">
													<Icon className="h-5 w-5 text-primary" />
												</div>
											</div>
											<span
												className="select-none font-mono text-5xl font-bold text-muted-foreground/10"
												aria-hidden="true"
											>
												{mod.number}
											</span>
										</div>
										<h3 className="font-display mt-6 text-lg font-semibold text-foreground">
											{mod.title}
										</h3>
										<p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-primary/70">
											{mod.roles}
										</p>
										<p className="mt-3 text-[14px] leading-6 text-muted-foreground">
											{mod.description}
										</p>
									</BlurIn>
								</BentoHoverCard>
							);
						})}
					</div>
				</div>
			</section>

			{/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-t border-border px-6 py-24 lg:px-10 lg:py-32">
				{/* Horizontal lines */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px)",
						backgroundSize: "100% 64px",
					}}
				/>
				{/* Center radial spotlight */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse 80% 60% at 50% 50%, color-mix(in oklch, var(--primary) 4%, transparent) 0%, transparent 70%)",
					}}
				/>
				{/* Watermark */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute bottom-4 right-4 hidden select-none text-[10rem] font-black leading-none tracking-[-0.06em] text-primary/[0.04] xl:block"
				>
					SYNC
				</div>
				<div className="mx-auto max-w-7xl">
					<BlurIn className="mb-16 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
								Patient journey
							</span>
							<h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-foreground">
								From first symptom to follow-up care.
							</h2>
						</div>
						<p className="max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground lg:text-right">
							CuraSync tracks the complete care journey across web and mobile.
						</p>
					</BlurIn>

					<div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:divide-x lg:divide-border">
						{workflowSteps.map((step, index) => (
							<BlurIn
								key={step.number}
								delay={index * 0.1}
								className={cn(
									"flex flex-col border-b border-border py-10 lg:border-b-0",
									index === 0 && "lg:pr-12",
									index === 1 && "lg:px-12",
									index === 2 && "lg:pl-12",
								)}
							>
								<span
									className="select-none font-mono text-[5rem] font-bold leading-none text-muted-foreground/[0.07]"
									aria-hidden="true"
								>
									{step.number}
								</span>
								<h3 className="font-display mt-5 text-lg font-semibold text-foreground">
									{step.title}
								</h3>
								<p className="mt-2.5 max-w-[36ch] text-[14px] leading-6 text-muted-foreground">
									{step.description}
								</p>
								<motion.div
									whileHover={{ x: 4 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<Link
										href={step.href}
										className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:text-primary/80"
									>
										{step.cta}
										<PiArrowRight className="h-3.5 w-3.5" />
									</Link>
								</motion.div>
							</BlurIn>
						))}
					</div>
				</div>
			</section>

			{/* ── CTA ──────────────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-t border-border bg-foreground px-6 py-24 lg:px-10 lg:py-32">
				{/* Light grid on dark bg */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"linear-gradient(color-mix(in oklch, var(--background) 7%, transparent) 1px, transparent 1px), linear-gradient(to right, color-mix(in oklch, var(--background) 7%, transparent) 1px, transparent 1px)",
						backgroundSize: "72px 72px",
					}}
				/>
				{/* Diagonal stripes */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							"repeating-linear-gradient(-45deg, transparent, transparent 40px, color-mix(in oklch, var(--background) 4%, transparent) 40px, color-mix(in oklch, var(--background) 4%, transparent) 41px)",
					}}
				/>
				{/* Left gradient glow */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 left-0 hidden w-[45vw] bg-gradient-to-r from-background/[0.06] to-transparent lg:block"
				/>
				{/* Watermark */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute right-4 top-6 hidden select-none text-[10rem] font-black leading-none tracking-[-0.06em] text-background/[0.04] xl:block"
				>
					HEALTH
				</div>
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
						<BlurIn>
							<span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-background/40">
								Get started
							</span>
							<h2 className="font-display mt-4 max-w-[40ch] text-4xl font-bold tracking-tight text-background lg:text-5xl">
								A unified platform for patients, doctors, and caregivers.
							</h2>
							<p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-background/55">
								CuraSync keeps symptom intake, appointments, blockchain-secured records,
								medication reminders, and IoT health monitoring on one connected track.
							</p>

							<div className="mt-10 grid gap-5 sm:grid-cols-2 lg:max-w-[500px]">
								<div>
									<p className="text-[14px] font-semibold text-background">
										SaaS deployment
									</p>
									<p className="mt-1 text-[13px] leading-5 text-background/50">
										Web dashboard for clinic staff. Mobile app for patients and
										caregivers.
									</p>
								</div>
								<div>
									<p className="text-[14px] font-semibold text-background">
										Built for Malaysia
									</p>
									<p className="mt-1 text-[13px] leading-5 text-background/50">
										Aligned with national digital health transformation and PDPA
										requirements.
									</p>
								</div>
							</div>
						</BlurIn>

						<BlurIn delay={0.15} className="flex flex-col gap-3">
							<Link
								href="/facilities"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-8 text-[15px] font-semibold text-foreground transition-colors hover:bg-background/90"
							>
								Explore facilities
								<PiArrowRight className="h-4 w-4" />
							</Link>
							<Link
								href="/partner/register"
								className="inline-flex h-12 items-center justify-center rounded-xl border border-background/20 px-8 text-[15px] font-medium text-background transition-colors hover:bg-background/10"
							>
								Register your clinic
							</Link>
						</BlurIn>
					</div>
				</div>
			</section>
		</main>
	);
}
