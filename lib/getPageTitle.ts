export function getPageTitle(pathname: string): string {
    // Remove query params
    const cleanPath = pathname.split("?")[0];

    // Break into segments
    const segments = cleanPath.split("/").filter(Boolean);

    // Remove "admin" prefix
    const adminIndex = segments.indexOf("admin");
    const relevant =
        adminIndex !== -1 ? segments.slice(adminIndex + 1) : segments;

    if (relevant.length === 0) {
        return "Dashboard";
    }

    /**
     * If last segment looks like an ID (uuid, cuid, nanoid, number),
     * use the previous segment as title
     */
    const last = relevant[relevant.length - 1];
    const prev = relevant[relevant.length - 2];

    const isId =
        /^[a-zA-Z0-9_-]{6,}$/.test(last) || // uuid / nanoid / cuid
        /^\d+$/.test(last); // numeric id

    let titleSegment = isId ? prev : last;

    if (!titleSegment) {
        titleSegment = last;
    }

    return formatTitle(titleSegment);
}

function formatTitle(value: string): string {
    return value
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
