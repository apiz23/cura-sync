-- cura_ledger_entries
-- Server-signed hash-chain ledger replacing the Polygon Amoy on-chain
-- registry. Each entry links to the previous entry's chain_hash for the same
-- record_id (classic hash-chain), and chain_hash is HMAC-signed with a
-- server-only secret (LEDGER_SIGNING_SECRET). Altering any past row breaks
-- the chain and invalidates its signature for every entry after it — the
-- same tamper-evidence property a public blockchain gives, without a wallet,
-- gas, or RPC dependency.
--
-- RLS enabled with no permissive policies: default-deny for the public anon
-- key, service-role-only access via lib/blockchain.ts (same convention as
-- cura_symptom_analyses).

create table if not exists public.cura_ledger_entries (
    id uuid primary key default gen_random_uuid(),
    record_id text not null,
    content_hash text not null,
    prev_hash text,
    chain_hash text not null,
    signature text not null,
    ipfs_cid text,
    created_at timestamptz not null default now()
);

create index if not exists cura_ledger_entries_record_id_idx
    on public.cura_ledger_entries (record_id, created_at desc);

alter table public.cura_ledger_entries enable row level security;
