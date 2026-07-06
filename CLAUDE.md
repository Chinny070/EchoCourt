@AGENTS.md

# EchoCourt

Decentralized social-context arbitration protocol on GenLayer.

## Stack
- Next.js 16 (App Router, `--webpack` flag required)
- React 19, TypeScript 5, Tailwind CSS 4
- genlayer-js SDK for contract interaction
- GenLayer StudioNet (chain)
- No traditional backend — frontend + GenLayer contract

## Key Paths
- Contract: `contracts/EchoCourt.py`
- GenLayer client: `lib/genlayer/client.ts`
- GenLayer types: `lib/genlayer/types.ts`
- UI components: `components/ui/` and `components/court/`
- Pages: `app/` (landing) and `app/app/` (authenticated app pages)

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build

## Contract Address
Set `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` in `.env.local` after deploying `contracts/EchoCourt.py` to GenLayer StudioNet.
