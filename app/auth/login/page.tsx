import type { Metadata } from "next";
import { LoginForm } from "./loginform";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Login | CuraSync",
    description: "Sign in to your CuraSync account",
};

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
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
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="https://i.pinimg.com/736x/dc/39/8f/dc398ff9ccbc49c02122a50fe1c37ba5.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover brightness-[0.8] grayscale-75  dark:brightness-[0.2] dark:grayscale"
                    fill
                    unoptimized
                />
            </div>
        </div>
    );
}
