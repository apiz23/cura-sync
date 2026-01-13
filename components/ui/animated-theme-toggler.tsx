"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<"button"> {
    duration?: number;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "ghost" | "outline";
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    size = "md",
    variant = "default",
    ...props
}: AnimatedThemeTogglerProps) => {
    const [isDark, setIsDark] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const transitionRef = useRef<Animation | null>(null);

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current || isTransitioning) return;

        setIsTransitioning(true);

        // Store current scroll position
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Prevent scroll during transition
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.top = `-${scrollY}px`;

        try {
            await document.startViewTransition(() => {
                flushSync(() => {
                    const newTheme = !isDark;
                    setIsDark(newTheme);
                    document.documentElement.classList.toggle("dark");
                    localStorage.setItem("theme", newTheme ? "dark" : "light");
                });
            }).ready;

            const { top, left, width, height } =
                buttonRef.current.getBoundingClientRect();
            const x = left + width / 2;
            const y = top + height / 2;
            const maxRadius = Math.hypot(
                Math.max(left, window.innerWidth - left),
                Math.max(top, window.innerHeight - top)
            );

            // Create and play animation
            const animation = document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${maxRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            );

            transitionRef.current = animation;

            // Wait for animation to complete
            await animation.finished;
        } catch (error) {
            console.error("Theme transition error:", error);
        } finally {
            // Restore scroll
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.width = "";
            document.body.style.top = "";

            // Restore scroll position
            window.scrollTo(scrollX, scrollY);

            setIsTransitioning(false);

            // Clean up animation
            if (transitionRef.current) {
                transitionRef.current.cancel();
                transitionRef.current = null;
            }
        }
    }, [isDark, duration, isTransitioning]);

    const sizeClasses = {
        sm: "h-8 w-8 min-w-8",
        md: "h-10 w-10 min-w-10",
        lg: "h-12 w-12 min-w-12",
    };

    const variantClasses = {
        default: "bg-background border hover:bg-accent",
        ghost: "hover:bg-accent",
        outline: "border hover:bg-accent",
    };

    const iconSize = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
    };

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <button
                        ref={buttonRef}
                        onClick={toggleTheme}
                        disabled={isTransitioning}
                        className={cn(
                            "relative inline-flex items-center justify-center rounded-full transition-all duration-300",
                            "transform hover:scale-105 active:scale-95",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "touch-manipulation", // Disable double-tap zoom on mobile
                            sizeClasses[size],
                            variantClasses[variant],
                            isDark ? "text-amber-300" : "text-indigo-600",
                            isTransitioning && "opacity-50 cursor-not-allowed",
                            className
                        )}
                        aria-label={`Switch to ${
                            isDark ? "light" : "dark"
                        } theme`}
                        aria-disabled={isTransitioning}
                        {...props}
                    >
                        {/* Background linear effect */}
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            {isDark ? (
                                <div className="absolute inset-0 rounded-full bg-linear-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10" />
                            ) : (
                                <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10" />
                            )}
                        </div>

                        {/* Icon container with animation */}
                        <div className="relative flex items-center justify-center overflow-hidden">
                            {/* Sun Icon */}
                            <Sun
                                className={cn(
                                    "transition-all duration-500 ease-in-out",
                                    iconSize[size],
                                    isDark
                                        ? "translate-y-0 rotate-0 opacity-100"
                                        : "-translate-y-6 rotate-90 opacity-0"
                                )}
                            />

                            {/* Moon Icon */}
                            <Moon
                                className={cn(
                                    "absolute transition-all duration-500 ease-in-out",
                                    iconSize[size],
                                    isDark
                                        ? "translate-y-6 rotate-90 opacity-0"
                                        : "translate-y-0 rotate-0 opacity-100"
                                )}
                            />
                        </div>

                        {/* Glow effect */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-full blur-md transition-opacity duration-300",
                                isDark ? "bg-amber-400/20" : "bg-blue-400/20",
                                "opacity-0 hover:opacity-100",
                                isTransitioning && "opacity-0"
                            )}
                        />

                        {/* Loading indicator */}
                        {isTransitioning && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className={cn(
                                        "rounded-full border-2 border-t-transparent animate-spin",
                                        isDark
                                            ? "border-amber-300"
                                            : "border-indigo-600",
                                        size === "sm" && "w-4 h-4",
                                        size === "md" && "w-5 h-5",
                                        size === "lg" && "w-6 h-6"
                                    )}
                                />
                            </div>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="px-2 py-1 text-xs">
                    <span
                        className={cn(
                            "font-medium",
                            isDark ? "text-amber-600" : "text-blue-600"
                        )}
                    >
                        {isTransitioning
                            ? "Switching theme..."
                            : `Switch to ${isDark ? "light" : "dark"} mode`}
                    </span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
