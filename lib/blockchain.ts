import "server-only";

import { Contract, JsonRpcProvider, Wallet, type Log } from "ethers";

import { hashRecord } from "@/lib/canonical-hash";

const RPC_URL =
	process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.SERVER_WALLET_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const REGISTRY_ABI = [
	"function registerRecord(string recordId, bytes32 contentHash, string ipfsCid) external",
	"function verifyRecord(string recordId, bytes32 contentHash) external view returns (bool)",
	"function getHistory(string recordId) external view returns (tuple(bytes32 contentHash, address registeredBy, uint256 timestamp, string ipfsCid)[])",
	"function getLatest(string recordId) external view returns (tuple(bytes32 contentHash, address registeredBy, uint256 timestamp, string ipfsCid) entry, bool exists)",
	"function getVersionCount(string recordId) external view returns (uint256)",
	"event RecordRegistered(string indexed recordId, bytes32 contentHash, string ipfsCid, uint256 timestamp, address registeredBy)",
] as const;

export type RegisterResult = {
	txHash: string;
	blockNumber: number | null;
	contentHash: string;
	ipfsCid: string;
	contractAddress: string;
	explorerUrl: string;
};

export type HistoryEntry = {
	contentHash: string;
	registeredBy: string;
	timestamp: number; // unix seconds
	ipfsCid: string;
};

export class BlockchainNotConfiguredError extends Error {
	constructor(missing: string) {
		super(`Blockchain not configured: missing ${missing}`);
		this.name = "BlockchainNotConfiguredError";
	}
}

let _provider: JsonRpcProvider | null = null;
let _wallet: Wallet | null = null;
let _contract: Contract | null = null;

function getProvider(): JsonRpcProvider {
	if (!_provider) _provider = new JsonRpcProvider(RPC_URL, 80002);
	return _provider;
}

function getWallet(): Wallet {
	if (!_wallet) {
		if (!PRIVATE_KEY) throw new BlockchainNotConfiguredError("SERVER_WALLET_KEY");
		_wallet = new Wallet(PRIVATE_KEY, getProvider());
	}
	return _wallet;
}

function getContract(readOnly = false): Contract {
	if (!CONTRACT_ADDRESS) throw new BlockchainNotConfiguredError("CONTRACT_ADDRESS");
	if (!_contract) {
		_contract = new Contract(
			CONTRACT_ADDRESS,
			REGISTRY_ABI,
			readOnly ? getProvider() : getWallet(),
		);
	}
	return _contract;
}

export function isBlockchainConfigured(): boolean {
	return Boolean(PRIVATE_KEY && CONTRACT_ADDRESS);
}

export function explorerUrl(txHash: string): string {
	return `https://amoy.polygonscan.com/tx/${txHash}`;
}

export function addressExplorerUrl(address: string): string {
	return `https://amoy.polygonscan.com/address/${address}`;
}

/**
 * Register a record hash + IPFS CID on Polygon Amoy.
 * Returns tx hash immediately after submission; block number after 1 confirmation.
 */
export async function registerOnChain(
	recordId: string,
	contentHash: string,
	ipfsCid = "",
): Promise<RegisterResult> {
	if (!isBlockchainConfigured()) {
		throw new BlockchainNotConfiguredError(
			!PRIVATE_KEY ? "SERVER_WALLET_KEY" : "CONTRACT_ADDRESS",
		);
	}

	const contract = getContract();
	const tx = await contract.registerRecord(recordId, contentHash, ipfsCid);
	const receipt = await tx.wait(1);

	return {
		txHash: tx.hash,
		blockNumber: receipt?.blockNumber ?? null,
		contentHash,
		ipfsCid,
		contractAddress: CONTRACT_ADDRESS!,
		explorerUrl: explorerUrl(tx.hash),
	};
}

/** Read-only verification — no gas, no transaction. */
export async function verifyOnChain(
	recordId: string,
	contentHash: string,
): Promise<boolean> {
	if (!CONTRACT_ADDRESS) throw new BlockchainNotConfiguredError("CONTRACT_ADDRESS");
	const contract = getContract(true);
	return (await contract.verifyRecord(recordId, contentHash)) as boolean;
}

export async function getHistory(recordId: string): Promise<HistoryEntry[]> {
	if (!CONTRACT_ADDRESS) throw new BlockchainNotConfiguredError("CONTRACT_ADDRESS");
	const contract = getContract(true);
	const raw = (await contract.getHistory(recordId)) as Array<
		[string, string, bigint, string]
	>;
	return raw.map(([contentHash, registeredBy, timestamp, ipfsCid]) => ({
		contentHash,
		registeredBy,
		timestamp: Number(timestamp),
		ipfsCid,
	}));
}

export async function getServerWalletInfo(): Promise<{
	address: string;
	balancePOL: string;
}> {
	const wallet = getWallet();
	const balance = await getProvider().getBalance(wallet.address);
	return {
		address: wallet.address,
		balancePOL: (Number(balance) / 1e18).toFixed(4),
	};
}

export { hashRecord };
export type { Log };
