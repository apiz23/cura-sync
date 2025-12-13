"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminLoginForm } from "./loginform";
import RegisterForm from "./registerform";
import Image from "next/image";

export default function AdminLogin() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                {/* HEADER */}
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link
                        href="/home"
                        className="flex items-center gap-2 font-medium"
                    >
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <Stethoscope className="size-4" />
                        </div>
                        CuraSync
                    </Link>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="login" className="w-full">
                                    Login
                                </TabsTrigger>
                                <TabsTrigger
                                    value="register"
                                    className="w-full"
                                >
                                    Register Staff
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <AdminLoginForm />
                            </TabsContent>

                            <TabsContent value="register">
                                <RegisterForm />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE IMAGE */}
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="https://i.pinimg.com/originals/4a/d2/50/4ad250e7cb41de5d80d189ee49995b21.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover brightness-[0.8] grayscale-75 dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}
