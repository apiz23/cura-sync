"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { ModeToggle } from "./mode-toggle"
import { BrandLogo } from "./brand-logo"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
    { name: "Home", href: "/home" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Facilities", href: "/facilities" },
    { name: "Register Health Center", href: "/partner/register" },
]

export default function Navbar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <motion.header
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand */}
                <Link href="/" className="group flex shrink-0 items-center gap-2.5">
                    <BrandLogo className="h-8 w-8 bg-background shadow-sm transition-transform duration-200 group-hover:scale-105" />
                    <span className="text-[15px] font-bold text-foreground">
                        CuraSync
                    </span>
                </Link>

                {/* Desktop nav — visible only at xl where all 5 items fit */}
                <nav className="hidden items-center gap-1 xl:flex">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 rounded-lg bg-primary/10"
                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    {/* Desktop login — xl only */}
                    <div className="hidden items-center gap-2 xl:flex">
                        <ModeToggle />
                        <Button
                            asChild
                            size="sm"
                            className="h-9 rounded-xl px-5 text-sm font-semibold"
                        >
                            <Link href="/auth/login">Login</Link>
                        </Button>
                    </div>

                    {/* Tablet/mobile: mode toggle + hamburger (< xl) */}
                    <div className="flex items-center gap-2 xl:hidden">
                        <ModeToggle />
                        {mounted ? (
                            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-lg"
                                        aria-label="Open navigation menu"
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            {isOpen ? (
                                                <motion.div
                                                    key="close"
                                                    initial={{ rotate: -90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: 90, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="menu"
                                                    initial={{ rotate: 90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                    exit={{ rotate: -90, opacity: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <Menu className="h-4 w-4" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </DrawerTrigger>

                                <DrawerContent className="bg-background p-0">
                                    <DrawerTitle className="sr-only">
                                        Navigation menu
                                    </DrawerTitle>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2.5 border-b border-border px-6 py-5">
                                            <BrandLogo className="h-8 w-8 bg-secondary" />
                                            <span className="text-[15px] font-bold text-foreground">
                                                CuraSync
                                            </span>
                                        </div>

                                        <nav className="flex flex-col gap-1 px-4 py-4">
                                            {navItems.map((item) => {
                                                const isActive = pathname === item.href
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setIsOpen(false)}
                                                        className={cn(
                                                            "rounded-xl px-4 py-3 text-[15px] font-medium transition-colors duration-150",
                                                            isActive
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                        )}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                )
                                            })}
                                        </nav>

                                        <div className="border-t border-border px-4 py-5">
                                            <Button
                                                asChild
                                                className="w-full rounded font-semibold"
                                            >
                                                <Link
                                                    href="/auth/login"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Login
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    )
}
