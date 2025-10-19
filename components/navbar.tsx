"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ModeToggle } from "@/components/mode-toggle";

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
                "fixed top-0 left-0 right-0 z-[40] w-full transition-all duration-500 border-b",
                isScrolled
                    ? "bg-background/95 backdrop-blur-xl shadow-sm border-border/50"
                    : "bg-transparent backdrop-blur-md border-transparent"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo - Fixed for light mode */}
                    <Link
                        href="/"
                        className="flex items-center space-x-3 group"
                    >
                        <div
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group-hover:scale-105",
                                isScrolled
                                    ? "bg-primary shadow-md"
                                    : "bg-primary shadow-lg"
                            )}
                        >
                            <Stethoscope className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span
                            className={cn(
                                "text-xl font-bold transition-colors duration-300",
                                isScrolled
                                    ? "text-foreground"
                                    : "text-foreground" 
                            )}
                        >
                            CuraSync
                        </span>
                    </Link>

                    {/* Desktop nav - Fixed colors */}
                    <nav className="hidden md:flex items-center space-x-1 ml-auto">
                        <Link
                            href="/"
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative",
                                pathname === "/"
                                    ? "text-primary bg-primary/10 font-semibold"
                                    : cn(
                                          isScrolled
                                              ? "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                              : "text-foreground/90 hover:text-primary hover:bg-accent/50"
                                      )
                            )}
                        >
                            Home
                            {pathname === "/" && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                        <Link
                            href="/pricing"
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative",
                                pathname === "/pricing"
                                    ? "text-primary bg-primary/10 font-semibold"
                                    : cn(
                                          isScrolled
                                              ? "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                              : "text-foreground/90 hover:text-primary hover:bg-accent/50"
                                      )
                            )}
                        >
                            Pricing
                            {pathname === "/pricing" && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                        <Link
                            href="/contact"
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 relative",
                                pathname === "/contact"
                                    ? "text-primary bg-primary/10 font-semibold"
                                    : cn(
                                          isScrolled
                                              ? "text-muted-foreground hover:text-primary hover:bg-muted/50"
                                              : "text-foreground/90 hover:text-primary hover:bg-accent/50"
                                      )
                            )}
                        >
                            Contact
                            {pathname === "/contact" && (
                                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    </nav>

                    {/* Right actions desktop - Fixed colors */}
                    <div className="hidden md:flex items-center space-x-2 ml-6">
                        <ModeToggle />
                        <Link href="/login">
                            <Button
                                variant={isScrolled ? "ghost" : "outline"}
                                size="sm"
                                className={cn(
                                    "transition-all duration-300",
                                    isScrolled
                                        ? "text-muted-foreground hover:text-primary"
                                        : "border-border text-foreground hover:bg-accent"
                                )}
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                size="sm"
                                className={cn(
                                    "transition-all duration-300 shadow-lg",
                                    "bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                )}
                            >
                                Sign Up
                            </Button>
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center space-x-2">
                        {/* Mode toggle now outside drawer */}
                        <ModeToggle />

                        {/* Drawer menu */}
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button
                                    variant={isScrolled ? "ghost" : "outline"}
                                    size="icon"
                                    className={cn(
                                        "transition-all duration-300",
                                        isScrolled
                                            ? ""
                                            : "border-border text-foreground hover:bg-accent"
                                    )}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent className="bg-background border-t">
                                <div className="flex flex-col space-y-4 p-6">
                                    <Link
                                        href="/"
                                        className={cn(
                                            "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
                                            pathname === "/"
                                                ? "text-primary bg-primary/10 font-semibold"
                                                : "text-foreground hover:text-primary hover:bg-accent"
                                        )}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className={cn(
                                            "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
                                            pathname === "/pricing"
                                                ? "text-primary bg-primary/10 font-semibold"
                                                : "text-foreground hover:text-primary hover:bg-accent"
                                        )}
                                    >
                                        Pricing
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className={cn(
                                            "text-lg font-medium py-3 px-4 rounded-lg transition-colors",
                                            pathname === "/contact"
                                                ? "text-primary bg-primary/10 font-semibold"
                                                : "text-foreground hover:text-primary hover:bg-accent"
                                        )}
                                    >
                                        Contact
                                    </Link>

                                    <div className="pt-6 flex flex-col space-y-4 border-t border-border">
                                        <Link href="/login">
                                            <Button
                                                variant="outline"
                                                className="w-full text-foreground"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/signup">
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
