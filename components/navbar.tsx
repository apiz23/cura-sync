"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ModeToggle } from "./mode-toggle";
import { BrandLogo } from "./brand-logo";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: "Home", href: "/home" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact", href: "/contact" },
        { name: "Facilities", href: "/facilities" },
        { name: "Register Health Center", href: "/partner/register" },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full bg-background border-b border-border"
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 md:h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group relative">
                        <BrandLogo className="bg-secondary h-10 w-10 shadow-lg shadow-primary/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30" />
                        <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary group-hover:to-primary/80">
                            CuraSync
                        </span>

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-1 bg-accent/30 rounded-2xl p-1 border border-border">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300",
                                            isActive
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                                        )}
                                    >
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="navbar-active"
                                                className="absolute inset-0 bg-primary/10 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Right actions desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        <ModeToggle />
                        <Link href="/auth/login">
                            <Button
                                variant="default"
                                size="default"
                                className="bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 px-6"
                            >
                                Login
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ModeToggle />
                        {mounted ? (
                            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-10 w-10 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isOpen ? (
                                                <motion.div
                                                    key="close"
                                                    initial={{ rotate: -90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: 90, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <X className="h-5 w-5" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="menu"
                                                    initial={{ rotate: 90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: -90, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Menu className="h-5 w-5" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent className="w-full sm:w-80 p-0 bg-background/95 backdrop-blur-xl">
                                    <div className="flex flex-col h-full">
                                        {/* Mobile Header */}
                                        <div className="p-6 border-b border-border">
                                            <Link
                                                href="/"
                                                className="flex items-center space-x-3"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <BrandLogo className="h-10 w-10" />
                                                <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                                    CuraSync
                                                </span>
                                            </Link>
                                        </div>

                                        {/* Mobile Navigation Links */}
                                        <div className="flex-1 overflow-y-auto py-6 px-4">
                                            <nav className="flex flex-col space-y-2">
                                                {navItems.map((item) => {
                                                    const isActive = pathname === item.href;
                                                    return (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "relative px-4 py-3 text-base font-medium rounded-xl transition-all duration-300",
                                                                isActive
                                                                    ? "text-primary bg-primary/10"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                                                            )}
                                                        >
                                                            {item.name}
                                                            {isActive && (
                                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                                            )}
                                                        </Link>
                                                    );
                                                })}
                                            </nav>
                                        </div>

                                        {/* Mobile Footer Actions */}
                                        <div className="p-6 border-t border-border space-y-3">
                                            <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                                <Button
                                                    variant="default"
                                                    className="w-full bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                                                >
                                                    Login
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10 rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
