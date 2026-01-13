"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/home" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact", href: "/contact" },
        { name: "Facility", href: "/facilities" },
        { name: "Register Health Center", href: "/partner/register" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40 w-full transition-all">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 group"
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-md transition-all duration-300 group-hover:scale-105">
                            <Stethoscope className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground transition-colors duration-300">
                            CuraSync
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center space-x-1 ml-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative",
                                    pathname === item.href
                                        ? "text-primary bg-primary/10 font-semibold"
                                        : "text-foreground/90 hover:text-primary hover:bg-accent/50"
                                )}
                            >
                                {item.name}
                                {pathname === item.href && (
                                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right actions desktop */}
                    <div className="hidden md:flex items-center space-x-2 ml-6">
                        <AnimatedThemeToggler />
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-accent"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center space-x-2">
                        <AnimatedThemeToggler />

                        {/* Drawer menu */}
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="transition-all duration-300 border-border text-foreground hover:bg-accent"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-background border-t">
                                <div className="flex flex-col space-y-4 p-6">
                                    {/* Mobile Nav Loop */}
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
                                                pathname === item.href
                                                    ? "text-primary bg-primary/10 font-semibold"
                                                    : "text-foreground hover:text-primary hover:bg-accent"
                                            )}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}

                                    <div className="pt-6 flex flex-col space-y-4 border-t border-border">
                                        <Link href="/auth/login">
                                            <Button
                                                variant="outline"
                                                className="w-full text-foreground"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>
            </div>
        </header>
    );
}
