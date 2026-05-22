-- Blockchain + IPFS integration columns
-- Adds tamper-evidence anchors to medical records + audit logs.

-- ── cura_encounters: IPFS file references (CID + decryption key) ────────
ALTER TABLE public.cura_encounters
  ADD COLUMN IF NOT EXISTS ipfs_cid TEXT,
  ADD COLUMN IF NOT EXISTS ipfs_encryption_key TEXT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_cura_encounters_ipfs_cid
  ON public.cura_encounters (ipfs_cid)
  WHERE ipfs_cid IS NOT NULL;

-- ── cura_audit_logs: blockchain proof columns ─────────────────────────────
ALTER TABLE public.cura_audit_logs
  ADD COLUMN IF NOT EXISTS tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS block_number BIGINT,
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS ipfs_cid TEXT;

CREATE INDEX IF NOT EXISTS idx_cura_audit_logs_tx_hash
  ON public.cura_audit_logs (tx_hash)
  WHERE tx_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cura_audit_logs_content_hash
  ON public.cura_audit_logs (content_hash)
  WHERE content_hash IS NOT NULL;

COMMENT ON COLUMN public.cura_encounters.ipfs_cid
  IS 'Pinata IPFS content-id for the encrypted file blob (if any).';
COMMENT ON COLUMN public.cura_encounters.ipfs_encryption_key
  IS 'Base64-encoded AES-256-GCM key. Treat as sensitive; never expose to client unless authorized.';
COMMENT ON COLUMN public.cura_encounters.content_hash
  IS 'keccak256 hash of the canonical record JSON registered on-chain.';

COMMENT ON COLUMN public.cura_audit_logs.tx_hash
  IS 'Polygon Amoy transaction hash that registered this record.';
COMMENT ON COLUMN public.cura_audit_logs.block_number
  IS 'Block number where the registerRecord tx was mined.';
COMMENT ON COLUMN public.cura_audit_logs.content_hash
  IS 'Snapshot of the content_hash at registration time (for tamper comparison).';
