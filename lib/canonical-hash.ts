import { createHash } from "crypto";

/**
 * Stable JSON serializer — keys sorted recursively so the same logical record
 * always produces the same string regardless of insertion order. Required for
 * deterministic on-chain hashing.
 */
export function canonicalize(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(canonicalize).join(",")}]`;
	}
	const obj = value as Record<string, unknown>;
	const keys = Object.keys(obj).sort();
	const entries = keys.map(
		(k) => `${JSON.stringify(k)}:${canonicalize(obj[k])}`,
	);
	return `{${entries.join(",")}}`;
}

/** sha256 of canonical JSON. Returns 0x-prefixed 32-byte hex. */
export function hashRecord(record: unknown): string {
	return "0x" + createHash("sha256").update(canonicalize(record)).digest("hex");
}

/**
 * Pick stable fields from a record before hashing. Excludes mutable system
 * fields (updated_at, etc.) so hash survives benign updates.
 */
export function pickHashableFields<T extends Record<string, unknown>>(
	record: T,
	fields: (keyof T)[],
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const f of fields) {
		if (record[f] !== undefined && record[f] !== null) {
			out[String(f)] = record[f];
		}
	}
	return out;
}
