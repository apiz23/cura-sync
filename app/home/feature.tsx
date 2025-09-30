import Link from "next/link";
import React from "react";

export default function Feature() {
    return (
        <section
            className="min-h-[70vh] py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-background to-muted"
            id="feature"
        >
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Advanced Healthcare Features
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Our platform combines cutting-edge technology with
                        medical expertise to provide reliable health assessments
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="feature-card bg-card p-8 shadow-lg border border-border rounded-xl">
                        <div className="icon-container bg-primary text-primary-foreground mb-6 w-12 h-12 flex items-center justify-center rounded-lg">
                            <i className="fas fa-brain text-2xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground mb-4">
                            AI Symptom Detection
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Advanced AI algorithms to help identify potential
                            health issues based on your reported symptoms.
                        </p>
                        <Link
                            href="/#features"
                            className="text-primary font-medium flex items-center hover:opacity-80 transition-colors"
                        >
                            Learn more
                            <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    </div>

                    {/* Card 2 */}
                    <div className="feature-card bg-card p-8 shadow-lg border border-border rounded-xl">
                        <div className="icon-container bg-green-500 text-white mb-6 w-12 h-12 flex items-center justify-center rounded-lg">
                            <i className="fas fa-lock text-2xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground mb-4">
                            Secure Medical Records
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Encrypted storage for your medical history and
                            documents, ensuring your data remains private and
                            secure.
                        </p>
                        <Link
                            href="/#records"
                            className="text-primary font-medium flex items-center hover:opacity-80 transition-colors"
                        >
                            Learn more
                            <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    </div>

                    {/* Card 3 */}
                    <div className="feature-card bg-card p-8 shadow-lg border border-border rounded-xl">
                        <div className="icon-container bg-red-500 text-white mb-6 w-12 h-12 flex items-center justify-center rounded-lg">
                            <i className="fas fa-user-md text-2xl"></i>
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground mb-4">
                            Doctor Verification
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Verified healthcare professionals for accurate
                            diagnoses and medical advice you can trust.
                        </p>
                        <Link
                            href="/#verification"
                            className="text-primary font-medium flex items-center hover:opacity-80 transition-colors"
                        >
                            Learn more
                            <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-muted p-6 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">
                            95%
                        </div>
                        <p className="text-muted-foreground">
                            Accuracy in preliminary assessments
                        </p>
                    </div>
                    <div className="bg-muted p-6 rounded-lg">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                            10k+
                        </div>
                        <p className="text-muted-foreground">
                            Verified medical professionals
                        </p>
                    </div>
                    <div className="bg-muted p-6 rounded-lg">
                        <div className="text-4xl font-bold text-purple-600 mb-2">
                            24/7
                        </div>
                        <p className="text-muted-foreground">
                            Access to health insights
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
