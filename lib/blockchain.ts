import "server-only";

import { createHash, createHmac } from "crypto";

import supabaseAdmin from "@/lib/supabase-admin";
import { hashRecord } from "@/lib/canonical-hash";

const LEDGER_SIGNING_SECRET = process.env.LEDGER_SIGNING_SECRET;
const GENESIS_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

export type RegisterResult = {
	txHash: string;
	blockNumber: number | null;
	contentHash: string;
	ipfsCid: string;
	contractAddress: string | null;
	explorerUrl: string | null;
};

export type HistoryEntry = {
	contentHash: string;
	registeredBy: string;
	timestamp: number; // unix seconds
	ipfsCid: string;
};

export class BlockchainNotConfiguredError extends Error {
	constructor(missing: string) {
		super(`Ledger not configured: missing ${missing}`);
		this.name = "BlockchainNotConfiguredError";
	}
}

type LedgerRow = {
	id: string;
	record_id: string;
	content_hash: string;
	prev_hash: string | null;
	chain_hash: string;
	signature: string;
	ipfs_cid: string | null;
	created_at: string;
};

function sign(chainHash: string): string {
	if (!LEDGER_SIGNING_SECRET) throw new BlockchainNotConfiguredError("LEDGER_SIGNING_SECRET");
	return createHmac("sha256", LEDGER_SIGNING_SECRET).update(chainHash).digest("hex");
}

function computeChainHash(prevHash: string, contentHash: string, createdAt: string): string {
	return (
		"0x" +
		createHash("sha256").update(`${prevHash}:${contentHash}:${createdAt}`).digest("hex")
	);
}

async function latestEntry(recordId: string): Promise<LedgerRow | null> {
	const { data } = await supabaseAdmin
		.from("cura_ledger_entries")
		.select("*")
		.eq("record_id", recordId)
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();
	return (data as LedgerRow | null) ?? null;
}

export function isBlockchainConfigured(): boolean {
	return Boolean(LEDGER_SIGNING_SECRET);
}

/**
 * Append a hash-chained, HMAC-signed ledger entry for a record. Each entry
 * links to the previous entry's chain hash, so altering any past row breaks
 * the chain (and its signature) for every entry after it — the same tamper-
 * evidence property a public blockchain gives you, without a wallet or gas.
 */
export async function registerOnChain(
	recordId: string,
	contentHash: string,
	ipfsCid = "",
): Promise<RegisterResult> {
	if (!isBlockchainConfigured()) {
		throw new BlockchainNotConfiguredError("LEDGER_SIGNING_SECRET");
	}

	const prev = await latestEntry(recordId);
	const prevHash = prev?.chain_hash ?? GENESIS_HASH;
	const createdAt = new Date().toISOString();
	const chainHash = computeChainHash(prevHash, contentHash, createdAt);
	const signature = sign(chainHash);

	const { data, error } = await supabaseAdmin
		.from("cura_ledger_entries")
		.insert({
			record_id: recordId,
			content_hash: contentHash,
			prev_hash: prevHash,
			chain_hash: chainHash,
			signature,
			ipfs_cid: ipfsCid || null,
			created_at: createdAt,
		})
		.select("id")
		.single();

	if (error || !data) {
		throw new Error(error?.message ?? "Failed to write ledger entry");
	}

	return {
		txHash: data.id,
		blockNumber: null,
		contentHash,
		ipfsCid,
		contractAddress: null,
		explorerUrl: null,
	};
}

/** Recomputes the HMAC signature over the stored chain hash and compares content hash. */
export async function verifyOnChain(
	recordId: string,
	contentHash: string,
): Promise<boolean> {
	if (!isBlockchainConfigured()) {
		throw new BlockchainNotConfiguredError("LEDGER_SIGNING_SECRET");
	}
	const entry = await latestEntry(recordId);
	if (!entry) return false;
	const expectedSignature = sign(entry.chain_hash);
	return expectedSignature === entry.signature && entry.content_hash === contentHash;
}

export async function getHistory(recordId: string): Promise<HistoryEntry[]> {
	const { data, error } = await supabaseAdmin
		.from("cura_ledger_entries")
		.select("*")
		.eq("record_id", recordId)
		.order("created_at", { ascending: true });

	if (error) throw new Error(error.message);

	return ((data as LedgerRow[]) ?? []).map((row) => ({
		contentHash: row.content_hash,
		registeredBy: "CuraSync Server",
		timestamp: Math.floor(new Date(row.created_at).getTime() / 1000),
		ipfsCid: row.ipfs_cid ?? "",
	}));
}

export { hashRecord };
