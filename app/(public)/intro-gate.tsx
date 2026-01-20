"use client";

import { useEffect, useState } from "react";
import IntroPage from "./intro-page";

export default function IntroGate() {
    const [showIntro, setShowIntro] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem("hasSeenIntro");

        if (!seen) {
            setShowIntro(true);

            const timer = setTimeout(() => {
                localStorage.setItem("hasSeenIntro", "true");
                setShowIntro(false);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, []);

    if (!showIntro) return null;

    return (
        <div className="fixed inset-0 z-9999 bg-background">
            <IntroPage />
        </div>
    );
}
