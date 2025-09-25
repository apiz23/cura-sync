"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ModeToggle } from "@/components/mode-toggle"; // 👈 import toggle

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[9999] w-full transition-all duration-300 border-b backdrop-blur-md",
                isScrolled ? "bg-background/95 shadow-sm" : "bg-background/80"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                            <Stethoscope className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-primary">
                            CuraSync
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center space-x-4 ml-auto">
                        <Link
                            href="/"
                            className={cn(
                                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === "/"
                                    ? "text-primary bg-muted"
                                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                            )}
                        >
                            Home
                        </Link>
                        <Link
                            href="/pricing"
                            className={cn(
                                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === "/pricing"
                                    ? "text-primary bg-muted"
                                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                            )}
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/contact"
                            className={cn(
                                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === "/contact"
                                    ? "text-primary bg-muted"
                                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                            )}
                        >
                            Contact
                        </Link>
                    </nav>

                    {/* Right actions desktop */}
                    <div className="hidden md:flex items-center space-x-3 ml-6">
                        <ModeToggle /> {/* 👈 toggle in desktop */}
                        <Link href="/login">
                            <Button
                                variant="ghost"
                                className="text-muted-foreground hover:text-primary"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Sign Up
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Drawer */}
                    <div className="md:hidden">
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="flex flex-col space-y-6 p-6">
                                    <Link
                                        href="/"
                                        className="text-lg font-medium transition-colors hover:text-primary"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="text-lg font-medium transition-colors hover:text-primary"
                                    >
                                        Pricing
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="text-lg font-medium transition-colors hover:text-primary"
                                    >
                                        Contact
                                    </Link>

                                    <div className="pt-6 flex flex-col space-y-4 border-t">
                                        <ModeToggle />{" "}
                                        {/* 👈 toggle in drawer */}
                                        <Link href="/login">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button className="w-full bg-primary hover:bg-primary/90">
                                                Sign Up
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
