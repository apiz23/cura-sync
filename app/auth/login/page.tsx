import type { Metadata } from "next";
import { LoginForm } from "./loginform";
import { Stethoscope, Shield, Activity, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
	title: "Login | CuraSync",
	description: "Sign in to your CuraSync healthcare management account",
};

export default function LoginPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="relative flex flex-col items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-6 md:p-10">
				<div className="absolute inset-0 bg-[linear-linear(45deg,transparent_25%,rgba(68,68,68,0.05)_25%,rgba(68,68,68,0.05)_75%,transparent_75%)] bg-size-20px_20px opacity-10"></div>
				<div className="relative z-10 w-full max-w-md space-y-8">
					{/* Header */}
					<div className="space-y-6 text-center">
						<div className="flex justify-center">
							<Link
								href="/home"
								className="group flex items-center gap-3 rounded-2xl bg-linear-to-r from-primary/10 to-primary/5 px-6 py-3 transition-all hover:from-primary/15 hover:to-primary/10"
							>
								<div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg">
									<Stethoscope className="size-5 text-white" />
								</div>
								<div className="flex flex-col items-start">
									<span className="text-lg font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
										CuraSync
									</span>
									<span className="text-xs text-muted-foreground">
										Healthcare Management
									</span>
								</div>
							</Link>
						</div>

						<div className="space-y-3">
							<h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
							<p className="text-muted-foreground">
								Sign in to access your healthcare management dashboard
							</p>
						</div>
					</div>

					{/* Login Form */}
					<div className="rounded-2xl border bg-card/50 p-8 backdrop-blur-sm">
						<LoginForm />
					</div>

					{/* Footer */}
					<div className="space-y-4 text-center text-sm">
						<p className="text-muted-foreground">
							Need help?{" "}
							<Link
								href="/support"
								className="font-medium text-primary hover:underline"
							>
								Contact Support
							</Link>
						</p>
						<div className="flex items-center justify-center gap-4">
							<Link
								href="/privacy"
								className="text-xs text-muted-foreground hover:text-foreground"
							>
								Privacy Policy
							</Link>
							<div className="h-4 w-px bg-border"></div>
							<Link
								href="/terms"
								className="text-xs text-muted-foreground hover:text-foreground"
							>
								Terms of Service
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Image */}
			<div className="relative hidden lg:block">
				<Image
					src="https://i.pinimg.com/736x/dc/39/8f/dc398ff9ccbc49c02122a50fe1c37ba5.jpg"
					alt="Healthcare professionals discussing patient care"
					className="absolute inset-0 h-full w-full object-cover"
					fill
					priority
					unoptimized
				/>

				{/* Overlay with linear and content */}
				<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent">
					<div className="absolute bottom-0 left-0 right-0 p-10 text-white">
						<div className="max-w-md">
							<div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
								<Stethoscope className="size-4" />
								<span className="text-sm font-medium">Trusted by 500+ Facilities</span>
							</div>
							<h2 className="mb-4 text-3xl font-bold">
								Modern Healthcare Management Made Simple
							</h2>
							<p className="text-white/80">
								Join thousands of healthcare professionals using CuraSync to streamline
								patient care, manage records securely, and improve operational
								efficiency.
							</p>
						</div>
					</div>
				</div>

				{/* Floating Elements */}
				<div className="absolute left-10 top-10 animate-float-slow">
					<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
						<Activity className="size-6 text-white" />
					</div>
				</div>
				<div className="absolute right-10 top-1/4 animate-float">
					<div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
						<Heart className="size-6 text-white" />
					</div>
				</div>
			</div>
		</div>
	);
}
