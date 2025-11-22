import React from "react";
import Hero from "./hero";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home | Curasync",
    description:
        "Welcome to Curasync — your smart companion for productivity and synchronization, helping you stay focused and organized every day!",
};

export default function Page() {
    return (
        <>
            <Hero />
        </>
    );
}
