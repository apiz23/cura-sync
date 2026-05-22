# CuraSync Blockchain (HealthRecordRegistry)

Hardhat workspace for the Polygon Amoy smart contract that anchors CuraSync
medical record hashes + IPFS CIDs on-chain.

## Quick start

```powershell
# 1. Install deps (from this folder)
pnpm install

# 2. Copy env template, paste your private key
copy .env.example .env
notepad .env

# 3. Compile + deploy
pnpm compile
pnpm deploy
```

Output line `Contract address : 0x...` → copy into
`cura-sync-web/.env.local` as `CONTRACT_ADDRESS=...`

## Network

- Chain: Polygon Amoy testnet
- Chain ID: 80002
- RPC: https://rpc-amoy.polygon.technology
- Explorer: https://amoy.polygonscan.com
- Faucet: https://faucet.polygon.technology (pick Amoy)

## Files

| File | Purpose |
|------|---------|
| `contracts/HealthRecordRegistry.sol` | Stores keccak256 hashes + IPFS CIDs |
| `scripts/deploy.js` | One-shot deploy to Amoy |
| `hardhat.config.js` | Network + solidity config |
| `.env` | **NEVER COMMIT** — wallet key |
