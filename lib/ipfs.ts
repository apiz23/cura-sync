import "server-only";

import crypto from "node:crypto";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = (process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud").replace(/\/+$/, "");

const PINATA_PIN_FILE = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_UNPIN = "https://api.pinata.cloud/pinning/unpin";

export class IPFSNotConfiguredError extends Error {
	constructor() {
		super("IPFS not configured: missing PINATA_JWT");
		this.name = "IPFSNotConfiguredError";
	}
}

export function isIpfsConfigured(): boolean {
	return Boolean(PINATA_JWT);
}

export function ipfsGatewayUrl(cid: string): string {
	if (!cid) return "";
	return `${PINATA_GATEWAY}/ipfs/${cid}`;
}

/**
 * AES-256-GCM envelope: [iv (12B)] [authTag (16B)] [ciphertext].
 * Per-record symmetric key, generated fresh each call.
 */
export function encryptBuffer(plaintext: Buffer): { encrypted: Buffer; keyB64: string } {
	const key = crypto.randomBytes(32);
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return {
		encrypted: Buffer.concat([iv, authTag, ciphertext]),
		keyB64: key.toString("base64"),
	};
}

export function decryptBuffer(envelope: Buffer, keyB64: string): Buffer {
	const key = Buffer.from(keyB64, "base64");
	const iv = envelope.subarray(0, 12);
	const authTag = envelope.subarray(12, 28);
	const ciphertext = envelope.subarray(28);
	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);
	return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export type UploadResult = {
	cid: string;
	size: number;
	gatewayUrl: string;
	encryptionKeyB64: string;
};

/**
 * Encrypt + upload to Pinata. Returns CID + encryption key. Store key
 * column-encrypted (or alongside record), never publish it.
 */
export async function uploadEncryptedFileToIPFS(
	file: Buffer,
	filename: string,
	mimeType = "application/octet-stream",
	metadataName?: string,
): Promise<UploadResult> {
	if (!PINATA_JWT) throw new IPFSNotConfiguredError();

	const { encrypted, keyB64 } = encryptBuffer(file);

	const form = new FormData();
	const blob = new Blob([new Uint8Array(encrypted)], { type: mimeType });
	form.append("file", blob, `${filename}.enc`);
	form.append(
		"pinataMetadata",
		JSON.stringify({
			name: metadataName || `${filename}.enc`,
			keyvalues: { mime: mimeType, encrypted: "aes-256-gcm" },
		}),
	);
	form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

	const res = await fetch(PINATA_PIN_FILE, {
		method: "POST",
		headers: { Authorization: `Bearer ${PINATA_JWT}` },
		body: form,
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Pinata upload failed (${res.status}): ${detail}`);
	}

	const data = (await res.json()) as { IpfsHash: string; PinSize: number };
	return {
		cid: data.IpfsHash,
		size: data.PinSize,
		gatewayUrl: ipfsGatewayUrl(data.IpfsHash),
		encryptionKeyB64: keyB64,
	};
}

/** Fetches encrypted file from Pinata gateway, returns decrypted plaintext. */
export async function fetchAndDecryptFromIPFS(
	cid: string,
	keyB64: string,
): Promise<Buffer> {
	const res = await fetch(ipfsGatewayUrl(cid));
	if (!res.ok) {
		throw new Error(`IPFS fetch failed (${res.status})`);
	}
	const envelope = Buffer.from(await res.arrayBuffer());
	return decryptBuffer(envelope, keyB64);
}

export async function unpinFromIPFS(cid: string): Promise<void> {
	if (!PINATA_JWT) throw new IPFSNotConfiguredError();
	await fetch(`${PINATA_UNPIN}/${cid}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${PINATA_JWT}` },
	});
}
