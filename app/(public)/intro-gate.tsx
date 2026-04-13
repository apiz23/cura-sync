"use client";

import { useEffect, useState } from "react";
import { CuraSyncEffect } from "@/components/ncdai/apple-hello-effect";

export default function IntroGate() {
	const [showIntro, setShowIntro] = useState(false);

	useEffect(() => {
		const seen = localStorage.getItem("hasSeenIntro");

		if (!seen) {
			setShowIntro(true);

			const timer = setTimeout(() => {
				localStorage.setItem("hasSeenIntro", "true");
				setShowIntro(false);
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, []);

	if (!showIntro) return null;

	return (
		<div className="fixed inset-0 z-9999 bg-background">
			<div className="fixed inset-0 flex items-center justify-center bg-background px-4">
				<CuraSyncEffect
					className="
          h-28
          sm:h-36
          md:h-44
          lg:h-52
          scale-75
          sm:scale-90
          md:scale-100
          dark:text-white
          text-black
        "
					speed={0.7}
					onAnimationComplete={() => {
						console.log("Animation done!");
					}}
				/>
			</div>{" "}
		</div>
	);
}
