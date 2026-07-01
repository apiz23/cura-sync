import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./loginform";
import { AuthBrandPanel } from "./brand-panel";

export const metadata: Metadata = {
	title: "Sign In | CuraSync",
	description: "Sign in to your CuraSync healthcare account",
};

export default function LoginPage() {
	return (
		<div className="flex min-h-svh">
			<AuthBrandPanel />
			<main className="flex flex-1 flex-col items-center justify-center bg-background px-8 py-12 lg:px-16">
				<div className="w-full max-w-[360px]">
					<Suspense fallback={<div className="h-64" />}>
						<LoginForm />
					</Suspense>
				</div>
			</main>
		</div>
	);
}
