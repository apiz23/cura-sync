import "server-only";

import supabaseAdmin from "@/lib/supabase-admin";
import { logAudit } from "@/lib/audit";
import {
	hashRecord,
	isBlockchainConfigured,
	registerOnChain,
} from "@/lib/blockchain";
import { pickHashableFields } from "@/lib/canonical-hash";

type AnchorActor = {
	actor_id: string;
	actor_type: "staff" | "patient";
};

type AnchorInput = {
	table: string;
	recordId: string;
	row: Record<string, unknown>;
	resourceType: string;
	actor: AnchorActor;
	action?: "CREATE" | "UPDATE" | "DELETE";
	ipfsCid?: string;
	patientBlockchainEnabled?: boolean;
};

const HASHABLE_FIELDS: Record<string, string[]> = {
	cura_conditions: ["profile_id", "name", "status", "severity", "onset_date", "notes"],
	cura_allergies: ["profile_id", "allergen", "reaction", "severity", "status", "notes"],
	cura_procedures: [
		"profile_id",
		"name",
		"procedure_date",
		"facility_name",
		"outcome",
		"notes",
	],
	cura_encounters: [
		"profile_id",
		"encounter_type",
		"encounter_date",
		"facility_name",
		"provider_name",
		"reason",
		"diagnosis_summary",
		"notes",
		"ipfs_cid",
	],
};

export type AnchorResult = {
	contentHash: string;
	txHash: string | null;
	blockNumber: number | null;
	skipped: boolean;
	error?: string;
};

/**
 * Hash a record + register it on Polygon Amoy + write audit log w/ proof.
 * Never throws — failures are logged into audit metadata so the original
 * Supabase insert never gets rolled back.
 */
export async function anchorRecord(input: AnchorInput): Promise<AnchorResult> {
	const fields = HASHABLE_FIELDS[input.table] ?? Object.keys(input.row);
	const hashable = pickHashableFields(input.row, fields);
	if (input.ipfsCid) hashable.ipfs_cid = input.ipfsCid;
	const action = input.action ?? "CREATE";

	const contentHash = hashRecord(hashable);

	// Patient opted out — log audit without tx data and return early.
	if (input.patientBlockchainEnabled === false) {
		void logAudit({
			...input.actor,
			action,
			resource_type: input.resourceType,
			resource_id: input.recordId,
			content_hash: contentHash,
			ipfs_cid: input.ipfsCid ?? null,
			metadata: { blockchain: "patient_disabled" },
		});
		return { contentHash, txHash: null, blockNumber: null, skipped: true };
	}

	if (!isBlockchainConfigured()) {
		void logAudit({
			...input.actor,
			action,
			resource_type: input.resourceType,
			resource_id: input.recordId,
			content_hash: contentHash,
			ipfs_cid: input.ipfsCid ?? null,
			metadata: { blockchain: "not_configured" },
		});
		return { contentHash, txHash: null, blockNumber: null, skipped: true };
	}

	try {
		const result = await registerOnChain(
			input.recordId,
			contentHash,
			input.ipfsCid ?? "",
		);

		void logAudit({
			...input.actor,
			action,
			resource_type: input.resourceType,
			resource_id: input.recordId,
			content_hash: contentHash,
			tx_hash: result.txHash,
			block_number: result.blockNumber,
			ipfs_cid: input.ipfsCid ?? null,
			metadata: { explorer_url: result.explorerUrl },
		});

		if (input.table === "cura_encounters") {
			await supabaseAdmin
				.from("cura_encounters")
				.update({ content_hash: contentHash, ipfs_cid: input.ipfsCid ?? null })
				.eq("id", input.recordId);
		}

		return {
			contentHash,
			txHash: result.txHash,
			blockNumber: result.blockNumber,
			skipped: false,
		};
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : "blockchain anchor failed";
		void logAudit({
			...input.actor,
			action,
			resource_type: input.resourceType,
			resource_id: input.recordId,
			content_hash: contentHash,
			ipfs_cid: input.ipfsCid ?? null,
			metadata: { blockchain_error: errorMessage },
		});
		return {
			contentHash,
			txHash: null,
			blockNumber: null,
			skipped: false,
			error: errorMessage,
		};
	}
}
