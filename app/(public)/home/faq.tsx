import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqItems = [
        {
            id: "item-1",
            question: "How accurate is the AI symptom checker?",
            answer: "Our AI system achieves 95% accuracy in preliminary assessments, but it's always recommended to consult with a healthcare professional for definitive diagnosis.",
        },
        {
            id: "item-2",
            question: "Is my medical data secure?",
            answer: "Yes, we use industry-standard encryption and comply with all healthcare data protection regulations to keep your information safe.",
        },
        {
            id: "item-3",
            question: "How are doctors verified?",
            answer: "All medical professionals on our platform undergo rigorous credential verification and licensing checks before they can provide services.",
        },
        {
            id: "item-4",
            question: "Can I access my records anytime?",
            answer: "Yes, your encrypted medical records are accessible 24/7 through our secure patient portal from any device.",
        },
        {
            id: "item-5",
            question: "What should I do in case of a medical emergency?",
            answer: "In case of a medical emergency, please call your local emergency number immediately. Our service is designed for non-emergency health concerns only.",
        },
        {
            id: "item-6",
            question:
                "How quickly will I get results from the symptom analysis?",
            answer: "Our AI analysis typically provides results within seconds. However, for more complex cases, it might take slightly longer to ensure accuracy.",
        },
    ];

    return (
        <section
            className="min-h-[70vh] flex items-center py-16 px-4 bg-gradient-to-tr from-background to-muted"
            id="faq"
        >
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-foreground mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about our medical AI
                        platform
                    </p>
                </div>

                <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
                    <Accordion
                        type="single"
                        collapsible
                        className="divide-y divide-border"
                    >
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="px-6"
                            >
                                <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground mb-6">
                        Still have questions?
                    </p>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-colors">
                        Contact Support
                    </button>
                </div>
            </div>
        </section>
    );
}
