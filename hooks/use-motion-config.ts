"use client";

import { useReducedMotion } from "framer-motion";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function staggerItem(i: number) {
	return {
		initial: { opacity: 0, y: 8 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.35, delay: 0.1 + Math.min(i, 7) * 0.04, ease: EASE },
	};
}

export const pageEnter = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.4, ease: EASE },
} as const;

export function useMotionConfig() {
	const reduced = useReducedMotion();
	return { ease: EASE, reduced: reduced ?? false };
}
