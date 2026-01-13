export function getPageTitle(pathname: string): string {
    const cleanPath = pathname.split("?")[0];
    const segments = cleanPath.split("/").filter(Boolean);

    if (segments.length === 0) return "Dashboard";

    /**
     * Common layout / group routes to ignore
     * (add more if needed, no logic changes required)
     */
    const LAYOUT_SEGMENTS = new Set([
        "user",
        "admin",
        "app",
        "(auth)",
        "(dashboard)",
    ]);

    const relevant = segments.filter((seg) => !LAYOUT_SEGMENTS.has(seg));

    if (relevant.length === 0) return "Dashboard";

    const last = relevant[relevant.length - 1];
    const prev = relevant[relevant.length - 2];

    /**
     * Detect dynamic route segments (ids)
     */
    const isId =
        /^[a-f0-9-]{36}$/.test(last) || // uuid
        /^[a-zA-Z0-9_-]{10,}$/.test(last) || // nanoid / cuid
        /^\d+$/.test(last); // numeric

    const baseSegment = isId && prev ? prev : last;

    /**
     * Optional human-friendly overrides
     * (purely additive, still dynamic)
     */
    const OVERRIDES: Record<string, string> = {
        medications: "Medications",
        profile: "My Profile",
        settings: "Settings",
    };

    return OVERRIDES[baseSegment] ?? formatTitle(baseSegment);
}

function formatTitle(value: string): string {
    return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
