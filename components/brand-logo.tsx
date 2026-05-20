"use client";

import Image from "next/image";
import logo from "@/public/icons/android-chrome-512x512.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
	className?: string;
	imageClassName?: string;
	alt?: string;
};

export function BrandLogo({
	className,
	imageClassName,
	alt = "CuraSync logo",
}: BrandLogoProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center overflow-hidden rounded-xl bg-[var(--logo-surface)] ring-1 ring-[var(--logo-ring)] shadow-sm",
				className,
			)}
		>
			<Image
				src={logo}
				alt={alt}
				width={48}
				height={48}
				className={cn("h-full w-full object-contain", imageClassName)}
			/>
		</div>
	);
}
