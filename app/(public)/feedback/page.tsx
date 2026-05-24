"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    CheckCircle2,
    ClipboardList,
    Loader2,
    Send,
    Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import PageTitle from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ── Zod schema (mirrors server schema) ───────────────────────────────────────

const ROLES = [
    "Doctor",
    "Staff / Receptionist",
    "Patient",
    "Caregiver",
    "Other",
] as const;

const TESTED_PARTS = [
    "Login / account access",
    "Appointment booking",
    "Appointment check-in",
    "Doctor consultation workflow",
    "Medical record viewing",
    "Medical record update",
    "Medication viewing",
    "AI symptom analyzer",
    "Health tracking / wearable sync",
    "Audit trail",
    "Other",
] as const;

const SUITABLE = ["Yes", "Maybe", "No"] as const;

const susRating = z.number().int().min(1).max(5);

const schema = z.object({
    email: z.string().email("Enter a valid email address."),
    role: z.enum(ROLES, { error: "Please select your role." }),
    used_during_session: z.boolean({
        error: "Please indicate whether you used CuraSync.",
    }),
    // Keep as plain array — no .default(); defaultValues in useForm provides []
    tested_parts: z.array(z.string()),

    sus_q4:  susRating,
    sus_q5:  susRating,
    sus_q6:  susRating,
    sus_q7:  susRating,
    sus_q8:  susRating,
    sus_q9:  susRating,
    sus_q10: susRating,
    sus_q11: susRating,
    sus_q12: susRating,
    sus_q13: susRating,

    // Optional free-text — no .default(); empty string defaults come from useForm
    liked_most:             z.string().max(2000).optional(),
    confusing_parts:        z.string().max(2000).optional(),
    errors_faced:           z.string().max(2000).optional(),
    suggested_improvements: z.string().max(2000).optional(),

    suitable_for_clinic: z.enum(SUITABLE, {
        error: "Please indicate whether CuraSync is suitable for clinic use.",
    }),
});

type FormValues = z.infer<typeof schema>;

// ── SUS question labels ───────────────────────────────────────────────────────

const SUS_QUESTIONS: { key: keyof FormValues; text: string; qNum: number }[] = [
    { key: "sus_q4",  qNum: 4,  text: "I think that I would like to use CuraSync frequently." },
    { key: "sus_q5",  qNum: 5,  text: "I found CuraSync unnecessarily complex." },
    { key: "sus_q6",  qNum: 6,  text: "I thought CuraSync was easy to use." },
    { key: "sus_q7",  qNum: 7,  text: "I think that I would need help from a technical person to use CuraSync." },
    { key: "sus_q8",  qNum: 8,  text: "I found the functions in CuraSync were well integrated." },
    { key: "sus_q9",  qNum: 9,  text: "I thought there was too much inconsistency in CuraSync." },
    { key: "sus_q10", qNum: 10, text: "I would imagine that most people would learn to use CuraSync very quickly." },
    { key: "sus_q11", qNum: 11, text: "I found CuraSync very cumbersome to use." },
    { key: "sus_q12", qNum: 12, text: "I felt confident using CuraSync." },
    { key: "sus_q13", qNum: 13, text: "I needed to learn a lot of things before I could use CuraSync." },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({
    number,
    title,
    subtitle,
}: {
    number: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {number}
            </div>
            <div>
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

function ChoiceButton({
    selected,
    onClick,
    children,
    className,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98]",
                selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/60 hover:text-foreground",
                className,
            )}
        >
            {children}
        </button>
    );
}

function CheckOption({
    checked,
    onToggle,
    label,
}: {
    checked: boolean;
    onToggle: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={cn(
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.98] text-left",
                checked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-muted/60 hover:text-foreground",
            )}
        >
            <span
                className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold transition-colors",
                    checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 bg-background",
                )}
            >
                {checked ? "✓" : ""}
            </span>
            {label}
        </button>
    );
}

function SusRatingRow({
    qNum,
    text,
    value,
    onChange,
    error,
}: {
    qNum: number;
    text: string;
    value: number | undefined;
    onChange: (v: number) => void;
    error?: string;
}) {
    return (
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-medium leading-relaxed text-foreground">
                <span className="mr-1.5 font-bold text-primary">{qNum}.</span>
                {text}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="w-32 shrink-0 text-xs text-muted-foreground">
                    Strongly Disagree
                </span>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            className={cn(
                                "h-10 w-10 rounded-lg border text-sm font-semibold transition-all duration-150 active:scale-95",
                                value === n
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                            )}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                    Strongly Agree
                </span>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PilotFeedbackPage() {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            tested_parts: [],
            liked_most: "",
            confusing_parts: "",
            errors_faced: "",
            suggested_improvements: "",
        },
    });

    const testedParts = watch("tested_parts") ?? [];

    const toggleTestedPart = (part: string) => {
        const current = testedParts;
        const next = current.includes(part)
            ? current.filter((p) => p !== part)
            : [...current, part];
        setValue("tested_parts", next, { shouldValidate: true });
    };

    const onSubmit = async (data: FormValues) => {
        const sendPromise = fetch("/api/public/pilot-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(async (res) => {
            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error ?? "Failed to submit feedback.");
            return json;
        });

        toast.promise(sendPromise, {
            loading: "Submitting your feedback…",
            success: "Feedback submitted — thank you!",
            error: (err) => (err instanceof Error ? err.message : "Submission failed."),
        });

        await sendPromise;
        setSubmitted(true);
    };

    // ── Success screen ───────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="public-grid-page public-dot-page px-4 pb-16 pt-20">
                <PageTitle title="Feedback — Thank You" />
                <div className="mx-auto max-w-2xl pt-12 text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Thank you for your feedback!
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground">
                        Your response has been recorded and will be used for academic
                        evaluation of CuraSync.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSubmitted(false)}
                        >
                            Submit another response
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────
    return (
        <div className="public-grid-page public-dot-page px-4 pb-16 pt-20">
            <PageTitle title="Pilot Testing Feedback" />
            <div className="mx-auto max-w-3xl space-y-6 pt-8">

                {/* Hero header */}
                <div className="public-text-panel space-y-3 p-6">
                    <div className="flex items-center gap-3">
                        <BrandLogo className="h-12 w-12 shrink-0" imageClassName="p-1" />
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                CuraSync — Clinic Pilot
                            </p>
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                                Usability Feedback Form
                            </h1>
                        </div>
                    </div>
                    <p className="pl-[60px] text-sm leading-relaxed text-muted-foreground">
                        This form is used to collect feedback after testing the CuraSync
                        healthcare platform during the clinic pilot session. Please answer
                        based on your experience using the system. Your response will be
                        used for academic evaluation only.
                    </p>
                    <div className="flex flex-wrap gap-2 pl-[60px]">
                        <Badge variant="outline" className="gap-1.5">
                            <Star className="h-3 w-3" />
                            Academic evaluation
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                            <ClipboardList className="h-3 w-3" />
                            18 questions · ~3 min
                        </Badge>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

                    {/* ── Email ─────────────────────────────────────────── */}
                    <Card className="border">
                        <CardContent className="space-y-3 p-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                                />
                                <FieldError message={errors.email?.message} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Section 1: Participant Information ─────────────── */}
                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader
                                number="1"
                                title="Participant Information"
                            />
                            <Separator />

                            {/* Q1 — Role */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    1. What is your role during the testing session?{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-wrap gap-2">
                                            {ROLES.map((r) => (
                                                <ChoiceButton
                                                    key={r}
                                                    selected={field.value === r}
                                                    onClick={() => field.onChange(r)}
                                                >
                                                    {r}
                                                </ChoiceButton>
                                            ))}
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.role?.message} />
                            </div>

                            {/* Q2 — Used during session */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    2. Did you use CuraSync during the testing session?{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="used_during_session"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex gap-2">
                                            <ChoiceButton
                                                selected={field.value === true}
                                                onClick={() => field.onChange(true)}
                                            >
                                                Yes
                                            </ChoiceButton>
                                            <ChoiceButton
                                                selected={field.value === false}
                                                onClick={() => field.onChange(false)}
                                            >
                                                No
                                            </ChoiceButton>
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.used_during_session?.message} />
                            </div>

                            {/* Q3 — Tested parts */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    3. Which part(s) of CuraSync did you test?{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        (Select all that apply)
                                    </span>
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {TESTED_PARTS.map((part) => (
                                        <CheckOption
                                            key={part}
                                            label={part}
                                            checked={testedParts.includes(part)}
                                            onToggle={() => toggleTestedPart(part)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Section 2: System Usability Scale ──────────────── */}
                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader
                                number="2"
                                title="System Usability Scale (SUS)"
                                subtitle="For each statement, select one answer from 1 (Strongly Disagree) to 5 (Strongly Agree)."
                            />
                            <Separator />

                            <div className="space-y-3">
                                {SUS_QUESTIONS.map(({ key, qNum, text }) => (
                                    <Controller
                                        key={key}
                                        name={key}
                                        control={control}
                                        render={({ field }) => (
                                            <SusRatingRow
                                                qNum={qNum}
                                                text={text}
                                                value={field.value as number | undefined}
                                                onChange={field.onChange}
                                                error={
                                                    (errors[key] as { message?: string } | undefined)?.message
                                                }
                                            />
                                        )}
                                    />
                                ))}
                            </div>

                            {/* Show a top-level error if any SUS fields are missing */}
                            {SUS_QUESTIONS.some(({ key }) => errors[key]) && (
                                <p className="text-xs text-destructive">
                                    Please rate all 10 usability statements above.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Section 3: Additional Feedback ─────────────────── */}
                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader
                                number="3"
                                title="Additional Feedback"
                            />
                            <Separator />

                            {/* Q14 */}
                            <div className="space-y-2">
                                <Label htmlFor="liked_most" className="text-sm font-medium">
                                    14. What did you like most about CuraSync?
                                </Label>
                                <Textarea
                                    id="liked_most"
                                    rows={3}
                                    placeholder="Share what impressed or delighted you…"
                                    className="resize-none"
                                    {...register("liked_most")}
                                />
                            </div>

                            {/* Q15 */}
                            <div className="space-y-2">
                                <Label htmlFor="confusing_parts" className="text-sm font-medium">
                                    15. What part of CuraSync was confusing or difficult to use?
                                </Label>
                                <Textarea
                                    id="confusing_parts"
                                    rows={3}
                                    placeholder="Describe any confusing steps or screens…"
                                    className="resize-none"
                                    {...register("confusing_parts")}
                                />
                            </div>

                            {/* Q16 */}
                            <div className="space-y-2">
                                <Label htmlFor="errors_faced" className="text-sm font-medium">
                                    16. Did you face any error, delay, or problem while using the system?
                                </Label>
                                <Textarea
                                    id="errors_faced"
                                    rows={3}
                                    placeholder="Describe any errors, crashes, or slow responses…"
                                    className="resize-none"
                                    {...register("errors_faced")}
                                />
                            </div>

                            {/* Q17 */}
                            <div className="space-y-2">
                                <Label htmlFor="suggested_improvements" className="text-sm font-medium">
                                    17. What feature would you suggest improving or adding?
                                </Label>
                                <Textarea
                                    id="suggested_improvements"
                                    rows={3}
                                    placeholder="Any features you wish existed or worked differently…"
                                    className="resize-none"
                                    {...register("suggested_improvements")}
                                />
                            </div>

                            {/* Q18 */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    18. Overall, do you think CuraSync is suitable for clinic use?{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="suitable_for_clinic"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex gap-2">
                                            {SUITABLE.map((opt) => (
                                                <ChoiceButton
                                                    key={opt}
                                                    selected={field.value === opt}
                                                    onClick={() => field.onChange(opt)}
                                                    className="min-w-[72px] justify-center"
                                                >
                                                    {opt}
                                                </ChoiceButton>
                                            ))}
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.suitable_for_clinic?.message} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Submit ─────────────────────────────────────────── */}
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full transition-all duration-150 active:scale-[0.99]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting…
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit feedback
                            </>
                        )}
                    </Button>

                    {/* Show top-level validation summary if user tries to submit with errors */}
                    {Object.keys(errors).length > 0 && (
                        <p className="text-center text-sm text-destructive">
                            Please complete all required fields before submitting.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
