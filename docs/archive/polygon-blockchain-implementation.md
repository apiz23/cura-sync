# Archived: Polygon Amoy blockchain implementation

Replaced 2026-07-06 with a server-signed hash-chain ledger
(`lib/blockchain.ts`, `supabase/migrations/20260706_000015_add_ledger_entries.sql`)
because running a real testnet contract (wallet key, RPC, gas, faucet) was
too much setup/maintenance cost for the tamper-evidence guarantee it bought.

This file preserves the original implementation for reference — full history
is also in git (`git log -- blockchain/` before this date), this is just a
single place to read it without digging through commits.

## What it did

- `blockchain/` — standalone Hardhat workspace, deployed to Polygon Amoy
  testnet (chain id 80002).
- `HealthRecordRegistry.sol` — on-chain registry: `registerRecord(recordId,
  contentHash, ipfsCid)` appends an entry per record id; `verifyRecord`,
  `getHistory`, `getLatest`, `getVersionCount` read it back.
- `lib/blockchain.ts` — server-side client using `ethers` v6: signed
  transactions with `SERVER_WALLET_KEY` (a funded EOA private key), talked to
  the deployed contract at `CONTRACT_ADDRESS` over `POLYGON_AMOY_RPC`.
- `lib/canonical-hash.ts` — hashed records with `keccak256(toUtf8Bytes(...))`
  (now uses Node's `sha256` instead — chain-specific hash no longer needed).
- Deployed contract address: `0x2f2E7073d6ed77781656c6d6Ea7A07314d69b4f8`
  (view at `https://amoy.polygonscan.com/address/0x2f2E7073d6ed77781656c6d6Ea7A07314d69b4f8`
  — testnet, may stop resolving if the contract or explorer indexing lapses).

## Contract — `blockchain/contracts/HealthRecordRegistry.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title HealthRecordRegistry — CuraSync on-chain audit anchor
/// @notice Stores keccak256 hashes of off-chain medical records + IPFS CIDs.
///         Used as tamper-evidence layer; full record stays in Supabase + IPFS.
contract HealthRecordRegistry {
    struct RecordEntry {
        bytes32 contentHash;
        address registeredBy;
        uint256 timestamp;
        string ipfsCid;
    }

    mapping(string => RecordEntry[]) private records;

    event RecordRegistered(
        string indexed recordId,
        bytes32 contentHash,
        string ipfsCid,
        uint256 timestamp,
        address registeredBy
    );

    function registerRecord(
        string calldata recordId,
        bytes32 contentHash,
        string calldata ipfsCid
    ) external {
        require(bytes(recordId).length > 0, "recordId empty");
        require(contentHash != bytes32(0), "contentHash empty");

        records[recordId].push(
            RecordEntry(contentHash, msg.sender, block.timestamp, ipfsCid)
        );

        emit RecordRegistered(
            recordId,
            contentHash,
            ipfsCid,
            block.timestamp,
            msg.sender
        );
    }

    function verifyRecord(string calldata recordId, bytes32 contentHash)
        external
        view
        returns (bool)
    {
        RecordEntry[] memory entries = records[recordId];
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].contentHash == contentHash) return true;
        }
        return false;
    }

    function getHistory(string calldata recordId)
        external
        view
        returns (RecordEntry[] memory)
    {
        return records[recordId];
    }

    function getLatest(string calldata recordId)
        external
        view
        returns (RecordEntry memory entry, bool exists)
    {
        RecordEntry[] memory entries = records[recordId];
        if (entries.length == 0) {
            return (entry, false);
        }
        return (entries[entries.length - 1], true);
    }

    function getVersionCount(string calldata recordId)
        external
        view
        returns (uint256)
    {
        return records[recordId].length;
    }
}
```

## Deploy script — `blockchain/scripts/deploy.js`

```javascript
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deployer:", deployer.address);
  console.log("Balance :", hre.ethers.formatEther(balance), "POL");

  if (balance === 0n) {
    throw new Error(
      "Deployer has 0 POL. Get test POL from https://faucet.polygon.technology (select Amoy).",
    );
  }

  const Registry = await hre.ethers.getContractFactory("HealthRecordRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const tx = registry.deploymentTransaction();

  console.log("\n=== Deployment successful ===");
  console.log("Contract address :", address);
  console.log("Tx hash          :", tx?.hash ?? "(unknown)");
  console.log(
    "Explorer         :",
    `https://amoy.polygonscan.com/address/${address}`,
  );
  console.log("\nAdd to cura-sync-web/.env.local:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Hardhat config — `blockchain/hardhat.config.js`

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const AMOY_RPC = process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology";
const KEY = process.env.SERVER_WALLET_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    amoy: {
      url: AMOY_RPC,
      accounts: KEY ? [KEY] : [],
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
```

## Server client — `lib/blockchain.ts` (pre-replacement version)

```typescript
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
```

## Env vars this used (removed from `.env.local`/`.env.example`)

```
POLYGON_AMOY_RPC=https://rpc-amoy.polygon.technology
SERVER_WALLET_KEY=0x...   # funded EOA private key, paid gas for every anchor
CONTRACT_ADDRESS=0x...    # deployed HealthRecordRegistry.sol address
```

## To bring this back

1. Restore `blockchain/` from git history: `git checkout <commit-before-removal> -- blockchain/`.
2. Restore `lib/blockchain.ts` and `lib/canonical-hash.ts` from this doc (or git history).
3. Re-add the three env vars above; redeploy the contract if the old address/testnet is gone.
4. Revert the UI copy in `app/user/blockchain/page.tsx` and `app/user/security/page.tsx` back to "Polygon Amoy" wording (git history has the old copy).
