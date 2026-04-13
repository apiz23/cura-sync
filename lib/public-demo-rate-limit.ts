const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 3;

type Entry = {
	count: number;
	resetAt: number;
};

const requestStore = new Map<string, Entry>();

export function getClientIp(headers: Headers): string {
	const forwardedFor = headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() || "unknown";
	}

	const realIp = headers.get("x-real-ip");
	if (realIp) {
		return realIp.trim();
	}

	return "unknown";
}

export function checkPublicDemoLimit(ip: string) {
	const now = Date.now();
	const existing = requestStore.get(ip);

	if (!existing || existing.resetAt <= now) {
		const nextEntry = { count: 1, resetAt: now + WINDOW_MS };
		requestStore.set(ip, nextEntry);
		return {
			allowed: true,
			remaining: MAX_REQUESTS - nextEntry.count,
			resetAt: nextEntry.resetAt,
		};
	}

	if (existing.count >= MAX_REQUESTS) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: existing.resetAt,
		};
	}

	existing.count += 1;
	requestStore.set(ip, existing);

	return {
		allowed: true,
		remaining: MAX_REQUESTS - existing.count,
		resetAt: existing.resetAt,
	};
}
