export type MedicationOption = {
    value: string;
    label: string;
};

export const MEDICATION_FREQUENCY_OPTIONS: MedicationOption[] = [
    { value: "Once daily", label: "Once daily" },
    { value: "Twice daily", label: "Twice daily" },
    { value: "Three times daily", label: "Three times daily" },
    { value: "Four times daily", label: "Four times daily" },
    { value: "Every 6 hours", label: "Every 6 hours" },
    { value: "Every 8 hours", label: "Every 8 hours" },
    { value: "Every 12 hours", label: "Every 12 hours" },
    { value: "Weekly", label: "Weekly" },
    { value: "As needed", label: "As needed" },
];

const SCHEDULE_OPTIONS_BY_FREQUENCY: Record<string, MedicationOption[]> = {
    "Once daily": [
        { value: "Morning", label: "Morning" },
        { value: "Noon", label: "Noon" },
        { value: "Evening", label: "Evening" },
        { value: "Night", label: "Night" },
    ],
    "Twice daily": [
        { value: "Morning and evening", label: "Morning and evening" },
        { value: "Noon and night", label: "Noon and night" },
        { value: "Every 12 hours", label: "Every 12 hours" },
    ],
    "Three times daily": [
        {
            value: "Morning, noon, and evening",
            label: "Morning, noon, and evening",
        },
        { value: "Every 8 hours", label: "Every 8 hours" },
    ],
    "Four times daily": [
        {
            value: "Morning, afternoon, evening, and night",
            label: "Morning, afternoon, evening, and night",
        },
        { value: "Every 6 hours", label: "Every 6 hours" },
    ],
    "Every 6 hours": [{ value: "Every 6 hours", label: "Every 6 hours" }],
    "Every 8 hours": [{ value: "Every 8 hours", label: "Every 8 hours" }],
    "Every 12 hours": [{ value: "Every 12 hours", label: "Every 12 hours" }],
    Weekly: [
        { value: "Once a week", label: "Once a week" },
        { value: "Same day every week", label: "Same day every week" },
    ],
    "As needed": [
        { value: "As needed", label: "As needed" },
        { value: "As directed", label: "As directed" },
    ],
};

const LEGACY_FREQUENCY_ALIASES: Record<string, string> = {
    Other: "As needed",
};

const LEGACY_SCHEDULE_ALIASES: Record<string, string> = {
    "Morning & Night": "Morning and evening",
    "Morning, Afternoon & Night": "Morning, noon, and evening",
    Afternoon: "Noon",
};

export function normalizeMedicationFrequency(value?: string | null): string {
    const trimmed = value?.trim();
    if (!trimmed) return MEDICATION_FREQUENCY_OPTIONS[0].value;

    const normalized = LEGACY_FREQUENCY_ALIASES[trimmed] ?? trimmed;
    return (
        MEDICATION_FREQUENCY_OPTIONS.find((option) => option.value === normalized)
            ?.value ?? MEDICATION_FREQUENCY_OPTIONS[0].value
    );
}

export function getScheduleOptionsForFrequency(
    frequency?: string | null
): MedicationOption[] {
    const normalizedFrequency = normalizeMedicationFrequency(frequency);
    return (
        SCHEDULE_OPTIONS_BY_FREQUENCY[normalizedFrequency] ??
        SCHEDULE_OPTIONS_BY_FREQUENCY["Once daily"]
    );
}

export function getDefaultScheduleForFrequency(frequency?: string | null): string {
    return getScheduleOptionsForFrequency(frequency)[0].value;
}

export function normalizeMedicationSchedule(
    frequency?: string | null,
    schedule?: string | null
): string {
    const options = getScheduleOptionsForFrequency(frequency);
    const trimmed = schedule?.trim();
    if (!trimmed) return options[0].value;

    const normalized = LEGACY_SCHEDULE_ALIASES[trimmed] ?? trimmed;
    return options.find((option) => option.value === normalized)?.value ?? options[0].value;
}
