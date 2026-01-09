"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun} from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

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
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
        if (!buttonRef.current) return;

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

        document.documentElement.animate(
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
    }, [isDark, duration]);

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
    };

    const variantClasses = {
        default:
            "bg-background border shadow-sm hover:bg-accent hover:shadow-md",
        ghost: "hover:bg-accent",
        outline: "border hover:bg-accent",
    };

    const iconSize = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
    };

    return (
        <button
            ref={buttonRef}
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "relative inline-flex items-center justify-center rounded-full transition-all duration-300",
                "transform hover:scale-105 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                sizeClasses[size],
                variantClasses[variant],
                isDark ? "text-amber-300" : "text-indigo-600",
                className
            )}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            {...props}
        >
            {/* Background linear effect */}
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100">
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
                    isDark
                        ? "bg-amber-400/20 group-hover:bg-amber-400/30"
                        : "bg-blue-400/20 group-hover:bg-blue-400/30",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
            />

            {/* Tooltip text on hover */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium opacity-0 transition-opacity duration-200 pointer-events-none">
                <span
                    className={cn(
                        "px-2 py-1 rounded-md",
                        isDark
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-blue-500/10 text-blue-600"
                    )}
                >
                    {isDark ? "Light mode" : "Dark mode"}
                </span>
            </div>
        </button>
    );
};
