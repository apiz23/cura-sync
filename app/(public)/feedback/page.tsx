"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    CheckCircle2,
    ClipboardList,
    Globe2,
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

type Language = "en" | "ms";
type LocalizedText = Record<Language, string>;

const ROLE_LABELS: Record<(typeof ROLES)[number], LocalizedText> = {
    Doctor: { en: "Doctor", ms: "Doktor" },
    "Staff / Receptionist": { en: "Staff / Receptionist", ms: "Staf / Penyambut tetamu" },
    Patient: { en: "Patient", ms: "Pesakit" },
    Caregiver: { en: "Caregiver", ms: "Penjaga" },
    Other: { en: "Other", ms: "Lain-lain" },
};

const TESTED_PART_LABELS: Record<(typeof TESTED_PARTS)[number], LocalizedText> = {
    "Login / account access": { en: "Login / account access", ms: "Log masuk / akses akaun" },
    "Appointment booking": { en: "Appointment booking", ms: "Tempahan janji temu" },
    "Appointment check-in": { en: "Appointment check-in", ms: "Daftar masuk janji temu" },
    "Doctor consultation workflow": { en: "Doctor consultation workflow", ms: "Aliran konsultasi doktor" },
    "Medical record viewing": { en: "Medical record viewing", ms: "Melihat rekod perubatan" },
    "Medical record update": { en: "Medical record update", ms: "Mengemas kini rekod perubatan" },
    "Medication viewing": { en: "Medication viewing", ms: "Melihat ubat-ubatan" },
    "AI symptom analyzer": { en: "AI symptom analyzer", ms: "Penganalisis simptom AI" },
    "Health tracking / wearable sync": { en: "Health tracking / wearable sync", ms: "Penjejakan kesihatan / segerak wearable" },
    "Audit trail": { en: "Audit trail", ms: "Jejak audit" },
    Other: { en: "Other", ms: "Lain-lain" },
};

const SUITABLE_LABELS: Record<(typeof SUITABLE)[number], LocalizedText> = {
    Yes: { en: "Yes", ms: "Ya" },
    Maybe: { en: "Maybe", ms: "Mungkin" },
    No: { en: "No", ms: "Tidak" },
};

const susRating = z.number().int().min(1).max(5);

const schema = z.object({
    email: z.string().email("Enter a valid email address."),
    role: z.enum(ROLES, { error: "Please select your role." }),
    used_during_session: z.boolean({
        error: "Please indicate whether you used CuraSync.",
    }),
    tested_parts: z.array(z.string()),

    sus_q4: susRating,
    sus_q5: susRating,
    sus_q6: susRating,
    sus_q7: susRating,
    sus_q8: susRating,
    sus_q9: susRating,
    sus_q10: susRating,
    sus_q11: susRating,
    sus_q12: susRating,
    sus_q13: susRating,

    liked_most: z.string().max(2000).optional(),
    confusing_parts: z.string().max(2000).optional(),
    errors_faced: z.string().max(2000).optional(),
    suggested_improvements: z.string().max(2000).optional(),

    suitable_for_clinic: z.enum(SUITABLE, {
        error: "Please indicate whether CuraSync is suitable for clinic use.",
    }),
});

type FormValues = z.infer<typeof schema>;

const SUS_QUESTIONS: { key: keyof FormValues; text: LocalizedText; qNum: number }[] = [
    {
        key: "sus_q4",
        qNum: 4,
        text: {
            en: "I would use CuraSync regularly if it was available.",
            ms: "Saya akan menggunakan CuraSync dengan kerap jika ia tersedia.",
        },
    },
    {
        key: "sus_q5",
        qNum: 5,
        text: {
            en: "CuraSync felt more complicated than it needed to be.",
            ms: "CuraSync terasa lebih rumit daripada yang sepatutnya.",
        },
    },
    {
        key: "sus_q6",
        qNum: 6,
        text: {
            en: "CuraSync was easy for me to use.",
            ms: "CuraSync mudah untuk saya gunakan.",
        },
    },
    {
        key: "sus_q7",
        qNum: 7,
        text: {
            en: "I would need help from a technical person to use CuraSync.",
            ms: "Saya memerlukan bantuan orang teknikal untuk menggunakan CuraSync.",
        },
    },
    {
        key: "sus_q8",
        qNum: 8,
        text: {
            en: "The main features worked well together.",
            ms: "Ciri-ciri utama berfungsi dengan baik bersama-sama.",
        },
    },
    {
        key: "sus_q9",
        qNum: 9,
        text: {
            en: "Some parts of CuraSync felt inconsistent or did not match.",
            ms: "Beberapa bahagian CuraSync terasa tidak konsisten atau tidak sepadan.",
        },
    },
    {
        key: "sus_q10",
        qNum: 10,
        text: {
            en: "Most people would learn to use CuraSync quickly.",
            ms: "Kebanyakan orang boleh belajar menggunakan CuraSync dengan cepat.",
        },
    },
    {
        key: "sus_q11",
        qNum: 11,
        text: {
            en: "CuraSync felt slow, awkward, or hard to move through.",
            ms: "CuraSync terasa lambat, tidak lancar, atau sukar digunakan.",
        },
    },
    {
        key: "sus_q12",
        qNum: 12,
        text: {
            en: "I felt confident while using CuraSync.",
            ms: "Saya berasa yakin semasa menggunakan CuraSync.",
        },
    },
    {
        key: "sus_q13",
        qNum: 13,
        text: {
            en: "I had to learn too many things before I could use CuraSync.",
            ms: "Saya perlu belajar terlalu banyak perkara sebelum boleh menggunakan CuraSync.",
        },
    },
];

const COPY = {
    en: {
        languageButton: "BM",
        languageLabel: "Switch to Malay",
        pageTitle: "Pilot Testing Feedback",
        successTitle: "Feedback - Thank You",
        pilotLabel: "CuraSync - Clinic Pilot",
        heading: "Usability Feedback Form",
        intro:
            "Please answer based on your experience testing CuraSync during the clinic pilot session. Your feedback will only be used for academic evaluation.",
        academicBadge: "Academic evaluation",
        questionCountBadge: "18 questions - about 3 min",
        emailLabel: "Email address",
        section1: "Participant Information",
        roleQuestion: "1. What was your role during the test?",
        usedQuestion: "2. Did you try CuraSync during the testing session?",
        testedQuestion: "3. Which parts of CuraSync did you try?",
        selectAll: "(Select all that apply)",
        yes: "Yes",
        no: "No",
        section2: "Ease of Use Rating",
        section2Subtitle: "Choose a number from 1 to 5 for each statement.",
        disagree: "Strongly disagree",
        agree: "Strongly agree",
        allSusRequired: "Please rate all 10 statements above.",
        section3: "Additional Feedback",
        likedMost: "14. What did you like most about CuraSync?",
        likedMostPlaceholder: "Share anything that worked well or felt useful...",
        confusingParts: "15. What was confusing or difficult to use?",
        confusingPartsPlaceholder: "Tell us which step, screen, or feature was unclear...",
        errorsFaced: "16. Did you face any error, delay, or problem?",
        errorsFacedPlaceholder: "Describe any errors, crashes, slow loading, or failed actions...",
        suggestedImprovements: "17. What should we improve or add?",
        suggestedImprovementsPlaceholder: "Share any feature, change, or idea that would help...",
        suitableQuestion: "18. Overall, is CuraSync suitable for clinic use?",
        submit: "Submit feedback",
        submitting: "Submitting...",
        validationSummary: "Please complete all required fields before submitting.",
        toastLoading: "Submitting your feedback...",
        toastSuccess: "Feedback submitted. Thank you!",
        toastError: "Submission failed.",
        successHeading: "Thank you for your feedback!",
        successMessage:
            "Your response has been recorded and will be used for the academic evaluation of CuraSync. We appreciate your time during the clinic pilot session.",
        responseRecorded: "Response recorded",
        susSubmitted: "Ease-of-use rating submitted",
        academicOnly: "Academic evaluation only",
        anotherResponse: "Submit another response",
    },
    ms: {
        languageButton: "EN",
        languageLabel: "Tukar ke Bahasa Inggeris",
        pageTitle: "Maklum Balas Ujian Perintis",
        successTitle: "Maklum Balas - Terima Kasih",
        pilotLabel: "CuraSync - Ujian Perintis Klinik",
        heading: "Borang Maklum Balas Kebolehgunaan",
        intro:
            "Sila jawab berdasarkan pengalaman anda mencuba CuraSync semasa sesi ujian perintis klinik. Maklum balas ini hanya digunakan untuk penilaian akademik.",
        academicBadge: "Penilaian akademik",
        questionCountBadge: "18 soalan - kira-kira 3 minit",
        emailLabel: "Alamat e-mel",
        section1: "Maklumat Peserta",
        roleQuestion: "1. Apakah peranan anda semasa ujian ini?",
        usedQuestion: "2. Adakah anda mencuba CuraSync semasa sesi ujian?",
        testedQuestion: "3. Bahagian CuraSync yang mana anda cuba?",
        selectAll: "(Pilih semua yang berkaitan)",
        yes: "Ya",
        no: "Tidak",
        section2: "Penilaian Kemudahan Penggunaan",
        section2Subtitle: "Pilih nombor 1 hingga 5 untuk setiap pernyataan.",
        disagree: "Sangat tidak setuju",
        agree: "Sangat setuju",
        allSusRequired: "Sila beri penilaian untuk semua 10 pernyataan di atas.",
        section3: "Maklum Balas Tambahan",
        likedMost: "14. Apakah yang paling anda suka tentang CuraSync?",
        likedMostPlaceholder: "Kongsikan perkara yang berfungsi dengan baik atau berguna...",
        confusingParts: "15. Apakah yang mengelirukan atau sukar digunakan?",
        confusingPartsPlaceholder: "Beritahu langkah, skrin, atau ciri yang tidak jelas...",
        errorsFaced: "16. Adakah anda mengalami ralat, kelewatan, atau masalah?",
        errorsFacedPlaceholder: "Terangkan ralat, crash, loading lambat, atau tindakan yang gagal...",
        suggestedImprovements: "17. Apa yang patut kami tambah baik atau tambah?",
        suggestedImprovementsPlaceholder: "Kongsikan ciri, perubahan, atau idea yang boleh membantu...",
        suitableQuestion: "18. Secara keseluruhan, adakah CuraSync sesuai digunakan di klinik?",
        submit: "Hantar maklum balas",
        submitting: "Sedang dihantar...",
        validationSummary: "Sila lengkapkan semua ruangan wajib sebelum menghantar.",
        toastLoading: "Sedang menghantar maklum balas...",
        toastSuccess: "Maklum balas telah dihantar. Terima kasih!",
        toastError: "Penghantaran gagal.",
        successHeading: "Terima kasih atas maklum balas anda!",
        successMessage:
            "Jawapan anda telah direkodkan dan akan digunakan untuk penilaian akademik CuraSync. Kami menghargai masa anda semasa sesi ujian perintis klinik.",
        responseRecorded: "Jawapan direkodkan",
        susSubmitted: "Penilaian kemudahan penggunaan dihantar",
        academicOnly: "Untuk penilaian akademik sahaja",
        anotherResponse: "Hantar jawapan lain",
    },
} satisfies Record<Language, Record<string, string>>;

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
                "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 active:scale-[0.98]",
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
    disagreeLabel,
    agreeLabel,
}: {
    qNum: number;
    text: string;
    value: number | undefined;
    onChange: (v: number) => void;
    error?: string;
    disagreeLabel: string;
    agreeLabel: string;
}) {
    return (
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
            <p className="text-sm font-medium leading-relaxed text-foreground">
                <span className="mr-1.5 font-bold text-primary">{qNum}.</span>
                {text}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="w-32 shrink-0 text-xs text-muted-foreground">
                    {disagreeLabel}
                </span>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            aria-label={`${n} - ${text}`}
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
                    {agreeLabel}
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

export default function PilotFeedbackPage() {
    const [submitted, setSubmitted] = useState(false);
    const [language, setLanguage] = useState<Language>("en");
    const copy = COPY[language];

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
        const next = testedParts.includes(part)
            ? testedParts.filter((p) => p !== part)
            : [...testedParts, part];
        setValue("tested_parts", next, { shouldValidate: true });
    };

    const onSubmit = async (data: FormValues) => {
        const sendPromise = fetch("/api/public/pilot-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(async (res) => {
            const json = await res.json().catch(() => null);
            if (!res.ok) throw new Error(json?.error ?? copy.toastError);
            return json;
        });

        toast.promise(sendPromise, {
            loading: copy.toastLoading,
            success: copy.toastSuccess,
            error: (err) => (err instanceof Error ? err.message : copy.toastError),
        });

        await sendPromise;
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="public-grid-page public-dot-page flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-24">
                <PageTitle title={copy.successTitle} />
                <div className="mx-auto w-full max-w-lg text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {copy.successHeading}
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                        {copy.successMessage}
                    </p>

                    <div className="my-8 border-t" />

                    <div className="flex flex-wrap justify-center gap-2">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            {copy.responseRecorded}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                            <Star className="h-3 w-3 text-primary" />
                            {copy.susSubmitted}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                            <ClipboardList className="h-3 w-3 text-primary" />
                            {copy.academicOnly}
                        </Badge>
                    </div>

                    <div className="mt-10">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto"
                            onClick={() => setSubmitted(false)}
                        >
                            {copy.anotherResponse}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="public-grid-page public-dot-page px-4 pb-16">
            <PageTitle title={copy.pageTitle} />
            <div className="mx-auto max-w-3xl space-y-6 pt-8">
                <div className="public-text-panel space-y-4 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-3">
                            <BrandLogo className="h-12 w-12 shrink-0" imageClassName="p-1" />
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                                    {copy.pilotLabel}
                                </p>
                                <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
                                    {copy.heading}
                                </h1>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full shrink-0 gap-2 sm:w-auto"
                            onClick={() => setLanguage((current) => (current === "en" ? "ms" : "en"))}
                            aria-label={copy.languageLabel}
                        >
                            <Globe2 className="h-4 w-4" />
                            {copy.languageButton}
                        </Button>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:pl-[60px]">
                        {copy.intro}
                    </p>
                    <div className="flex flex-wrap gap-2 sm:pl-[60px]">
                        <Badge variant="outline" className="gap-1.5">
                            <Star className="h-3 w-3" />
                            {copy.academicBadge}
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                            <ClipboardList className="h-3 w-3" />
                            {copy.questionCountBadge}
                        </Badge>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    <Card className="border">
                        <CardContent className="space-y-3 p-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    {copy.emailLabel} <span className="text-destructive">*</span>
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

                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader number="1" title={copy.section1} />
                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {copy.roleQuestion} <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-wrap gap-2">
                                            {ROLES.map((role) => (
                                                <ChoiceButton
                                                    key={role}
                                                    selected={field.value === role}
                                                    onClick={() => field.onChange(role)}
                                                >
                                                    {ROLE_LABELS[role][language]}
                                                </ChoiceButton>
                                            ))}
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.role?.message} />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {copy.usedQuestion} <span className="text-destructive">*</span>
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
                                                {copy.yes}
                                            </ChoiceButton>
                                            <ChoiceButton
                                                selected={field.value === false}
                                                onClick={() => field.onChange(false)}
                                            >
                                                {copy.no}
                                            </ChoiceButton>
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.used_during_session?.message} />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {copy.testedQuestion}{" "}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {copy.selectAll}
                                    </span>
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {TESTED_PARTS.map((part) => (
                                        <CheckOption
                                            key={part}
                                            label={TESTED_PART_LABELS[part][language]}
                                            checked={testedParts.includes(part)}
                                            onToggle={() => toggleTestedPart(part)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader
                                number="2"
                                title={copy.section2}
                                subtitle={copy.section2Subtitle}
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
                                                text={text[language]}
                                                value={field.value as number | undefined}
                                                onChange={field.onChange}
                                                disagreeLabel={copy.disagree}
                                                agreeLabel={copy.agree}
                                                error={
                                                    (errors[key] as { message?: string } | undefined)?.message
                                                }
                                            />
                                        )}
                                    />
                                ))}
                            </div>

                            {SUS_QUESTIONS.some(({ key }) => errors[key]) && (
                                <p className="text-xs text-destructive">
                                    {copy.allSusRequired}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border">
                        <CardContent className="space-y-6 p-6">
                            <SectionHeader number="3" title={copy.section3} />
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="liked_most" className="text-sm font-medium">
                                    {copy.likedMost}
                                </Label>
                                <Textarea
                                    id="liked_most"
                                    rows={3}
                                    placeholder={copy.likedMostPlaceholder}
                                    className="resize-none"
                                    {...register("liked_most")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confusing_parts" className="text-sm font-medium">
                                    {copy.confusingParts}
                                </Label>
                                <Textarea
                                    id="confusing_parts"
                                    rows={3}
                                    placeholder={copy.confusingPartsPlaceholder}
                                    className="resize-none"
                                    {...register("confusing_parts")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="errors_faced" className="text-sm font-medium">
                                    {copy.errorsFaced}
                                </Label>
                                <Textarea
                                    id="errors_faced"
                                    rows={3}
                                    placeholder={copy.errorsFacedPlaceholder}
                                    className="resize-none"
                                    {...register("errors_faced")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suggested_improvements" className="text-sm font-medium">
                                    {copy.suggestedImprovements}
                                </Label>
                                <Textarea
                                    id="suggested_improvements"
                                    rows={3}
                                    placeholder={copy.suggestedImprovementsPlaceholder}
                                    className="resize-none"
                                    {...register("suggested_improvements")}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">
                                    {copy.suitableQuestion} <span className="text-destructive">*</span>
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
                                                    {SUITABLE_LABELS[opt][language]}
                                                </ChoiceButton>
                                            ))}
                                        </div>
                                    )}
                                />
                                <FieldError message={errors.suitable_for_clinic?.message} />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full transition-all duration-150 active:scale-[0.99]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {copy.submitting}
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                {copy.submit}
                            </>
                        )}
                    </Button>

                    {Object.keys(errors).length > 0 && (
                        <p className="text-center text-sm text-destructive">
                            {copy.validationSummary}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
