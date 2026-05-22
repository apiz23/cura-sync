const DEFAULT_CURA_SYNC_AI_URL = "http://127.0.0.1:8000";

function normalizeAiBaseUrl(value: string | undefined) {
	const rawValue = value?.trim().replace(/^['"]|['"]$/g, "");
	const baseValue = rawValue || DEFAULT_CURA_SYNC_AI_URL;
	const withProtocol = /^https?:\/\//i.test(baseValue)
		? baseValue
		: `${baseValue.includes("localhost") || baseValue.includes("127.0.0.1") ? "http" : "https"}://${baseValue}`;

	return withProtocol.replace(/\/+$/, "");
}

export const curaSyncAiBaseUrl = normalizeAiBaseUrl(
	process.env.CURA_SYNC_AI_URL ?? process.env.NEXT_PUBLIC_CURA_SYNC_AI,
);

export function curaSyncAiUrl(path: `/${string}`) {
	return new URL(path, `${curaSyncAiBaseUrl}/`).toString();
}

export async function readAiError(response: Response, fallback: string) {
	const text = await response.text().catch(() => "");
	if (!text) return fallback;

	try {
		const data = JSON.parse(text) as { detail?: unknown; error?: unknown };
		if (typeof data.detail === "string") return data.detail;
		if (typeof data.error === "string") return data.error;
		return JSON.stringify(data.detail ?? data.error ?? data);
	} catch {
		return text;
	}
}
