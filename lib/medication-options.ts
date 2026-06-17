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

const DEFAULT_TIMES_BY_FREQUENCY: Record<string, string[]> = {
    "Once daily":        ["08:00"],
    "Twice daily":       ["08:00", "20:00"],
    "Three times daily": ["08:00", "14:00", "20:00"],
    "Four times daily":  ["08:00", "12:00", "16:00", "20:00"],
    "Every 6 hours":     ["06:00", "12:00", "18:00", "00:00"],
    "Every 8 hours":     ["06:00", "14:00", "22:00"],
    "Every 12 hours":    ["08:00", "20:00"],
    "Weekly":            ["08:00"],
    "As needed":         [],
};

const LEGACY_FREQUENCY_ALIASES: Record<string, string> = {
    Other: "As needed",
};

export function normalizeMedicationFrequency(value?: string | null): string {
    const trimmed = value?.trim();
    if (!trimmed) return MEDICATION_FREQUENCY_OPTIONS[0].value;
    const normalized = LEGACY_FREQUENCY_ALIASES[trimmed] ?? trimmed;
    return (
        MEDICATION_FREQUENCY_OPTIONS.find((o) => o.value === normalized)?.value ??
        MEDICATION_FREQUENCY_OPTIONS[0].value
    );
}

export function getDefaultTimesForFrequency(frequency?: string | null): string[] {
    const f = normalizeMedicationFrequency(frequency);
    return [...(DEFAULT_TIMES_BY_FREQUENCY[f] ?? ["08:00"])];
}

export function getTimeSlotsCount(frequency?: string | null): number {
    return getDefaultTimesForFrequency(frequency).length;
}

/** Parse existing schedule string (legacy labels or HH:MM) into time array. */
export function parseScheduleToTimes(
    frequency?: string | null,
    schedule?: string | null,
): string[] {
    const defaults = getDefaultTimesForFrequency(frequency);
    if (!schedule?.trim()) return defaults;

    // Already HH:MM format
    const timeMatches = schedule.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g);
    if (timeMatches && timeMatches.length > 0) {
        const normalized = timeMatches.map((t) => {
            const [h, m] = t.split(":");
            return `${String(parseInt(h)).padStart(2, "0")}:${m}`;
        });
        // Pad or trim to match slot count
        const count = defaults.length;
        if (normalized.length >= count) return normalized.slice(0, count);
        return [...normalized, ...defaults.slice(normalized.length)];
    }

    // Legacy keyword mapping
    const t = schedule.toLowerCase();
    const mapped: string[] = [];
    if (/morning/.test(t)) mapped.push("08:00");
    if (/noon|midday|lunch/.test(t)) mapped.push("12:00");
    if (/afternoon/.test(t)) mapped.push("14:00");
    if (/evening/.test(t)) mapped.push("19:00");
    if (/night|bed/.test(t)) mapped.push("21:00");

    if (mapped.length > 0) {
        const count = defaults.length;
        if (mapped.length >= count) return mapped.slice(0, count);
        return [...mapped, ...defaults.slice(mapped.length)];
    }

    return defaults;
}

/** Join times array into schedule string stored in DB. */
export function timesToScheduleString(times: string[]): string {
    return times.filter(Boolean).join(", ");
}

// Legacy compat — kept so any old import doesn't break
export function getDefaultScheduleForFrequency(frequency?: string | null): string {
    return timesToScheduleString(getDefaultTimesForFrequency(frequency));
}

export function getScheduleOptionsForFrequency(_frequency?: string | null): MedicationOption[] {
    return [];
}

export function normalizeMedicationSchedule(
    frequency?: string | null,
    schedule?: string | null,
): string {
    return timesToScheduleString(parseScheduleToTimes(frequency, schedule));
}
