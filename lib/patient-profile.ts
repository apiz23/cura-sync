const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parsePatientDate(value?: string | null): Date | null {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const match = DATE_ONLY_PATTERN.exec(trimmed);
    if (match) {
        const [, year, month, day] = match;
        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            12,
            0,
            0,
            0
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function calculatePatientAge(dateOfBirth?: string | null): number | null {
    const birthDate = parsePatientDate(dateOfBirth);
    if (!birthDate) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age >= 0 ? age : null;
}

export function formatPatientDate(
    value?: string | null,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    },
    fallback = "N/A"
): string {
    const date = parsePatientDate(value);
    if (!date) return fallback;

    return date.toLocaleDateString("en-US", options);
}

export function calculatePatientBmi(
    heightCm?: number | null,
    weightKg?: number | null
): string | null {
    if (!heightCm || !weightKg) return null;

    const heightM = heightCm / 100;
    if (!heightM) return null;

    return (weightKg / (heightM * heightM)).toFixed(1);
}
