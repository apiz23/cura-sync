export function parseEndDate(value: string) {
    const raw = value.trim();
    if (!raw) return null;

    // If the DB stores a date-only value (YYYY-MM-DD), treat it as local end-of-day
    // so it doesn't "expire early" due to Date() parsing as UTC midnight.
    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return null;
        }
        return new Date(year, month - 1, day, 23, 59, 59, 999);
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseStartDate(value: string) {
    const raw = value.trim();
    if (!raw) return null;

    const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return null;
        }
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isMedicationExpired(endDate: string | null | undefined, now = new Date()) {
    if (!endDate) return false;
    const parsed = parseEndDate(endDate);
    if (!parsed) return false;
    return now.getTime() > parsed.getTime();
}

export function isMedicationActiveOnDate(
    startDate: string | null | undefined,
    endDate: string | null | undefined,
    now = new Date(),
) {
    if (!startDate) return false;
    const start = parseStartDate(startDate);
    if (!start) return false;
    const end = endDate ? parseEndDate(endDate) : null;
    if (end && now.getTime() > end.getTime()) return false;
    return now.getTime() >= start.getTime();
}
