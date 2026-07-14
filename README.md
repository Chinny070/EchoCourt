# EchoCourt

Decentralized social-context arbitration protocol on GenLayer. A meaning court for online communities.

**Live:** [echocourt.vercel.app](https://echocourt.vercel.app)

## What is EchoCourt?

When communities disagree about what something *meant*, EchoCourt gives them a place to interpret it. Instead of binary moderation (ban/allow), EchoCourt uses GenLayer's non-deterministic AI validators to deliver nuanced, consensus-backed verdicts that consider intent, impact, context, and community standards.

## How It Works

1. **Create Charter** — Define your community's norms, forbidden behaviours, tone expectations, and remedy policies
2. **Open Case** — Submit a dispute with evidence, context, and a claim statement
3. **Respond** — The respondent provides their side with counter-evidence and mitigating factors
4. **Interpret** — GenLayer validators independently evaluate the case against the community charter using AI
5. **Verdict** — A consensus-backed interpretation is delivered with confidence scores and recommended remedies
6. **Appeal** — Either party can appeal with new evidence or on procedural grounds

## Verdict Dimensions

Each verdict evaluates:
- **Primary Interpretation** — no_violation, minor_norm_drift, contextual_misunderstanding, careless_harm, clear_violation, severe_violation, bad_faith_claim, insufficient_context
- **Impact Level** — none, low, medium, high, severe
- **Intent Assessment** — likely_benign, careless, reckless, targeted, manipulative
- **Context Quality** — strong_context, partial_context, thin_context, conflicting_context
- **Charter Alignment** — aligned, borderline, misaligned, clearly_violated
- **Recommended Remedy** — no_action, private_clarification, public_clarification, mediation, warning, apology_requested, temporary_restriction, removal_recommended, dismiss_claim

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Chain:** GenLayer StudioNet
- **Contract:** Python intelligent contract with non-deterministic AI interpretation
- **SDK:** genlayer-js for contract interaction
- **Wallet:** MetaMask / Rabby (any EVM wallet)

## Contract

Deployed on GenLayer StudioNet at:
```
0x91d87c8126d25d86284a051cCb2c963E7dF805c9
```

Contract source: [`contracts/EchoCourt.py`](contracts/EchoCourt.py)

### Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `create_charter` | write | Register a community charter with norms and policies |
| `submit_case` | write | Open a new dispute case (caller-bound) |
| `submit_response` | write | Respondent submits their side (respondent-only) |
| `request_interpretation` | write | Trigger AI validator interpretation (parties-only, human review fallback) |
| `appeal_case` | write | Appeal a decided verdict (parties-only) |
| `resolve_appeal` | write | AI re-evaluates with appeal arguments (upheld/modified/overturned) |
| `flag_for_human_review` | write | Charter creator flags a case for human review |
| `get_case` | view | Read case details |
| `get_verdict` | view | Read verdict for a case |
| `get_charter` | view | Read community charter |
| `get_community_cases` | view | List all cases for a community |
| `get_appeal` | view | Read appeal details |
| `get_stats` | view | Get total case count |

## Use Cases

- **DAOs** — Govern proposal disputes and contributor conflicts
- **Creator Communities** — Handle content attribution and collaboration disagreements
- **Gaming Guilds** — Mediate in-game toxicity and conduct violations
- **Moderation Councils** — Provide structured interpretation for platform rules

## Development

```bash
npm install
npm run dev
```

Set your contract address in `.env.local`:
```
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x91d87c8126d25d86284a051cCb2c963E7dF805c9
```

## Project Structure

```
app/                    # Next.js pages
  page.tsx              # Landing page
  app/
    charter/            # Charter creation
    cases/new/          # Case intake form
    cases/[id]/         # Case room (verdict, timeline, charter lens)
    cases/[id]/respond/ # Respondent form
    cases/[id]/appeal/  # Appeal form
    archive/            # Case archive search
components/
  court/                # VerdictSeal, ConfidenceMeter, InterpretationGrid, etc.
  ui/                   # Button, Card, Badge, Input, Select
  wallet/               # WalletButton, TransactionToast
  layout/               # Header
contracts/
  EchoCourt.py          # GenLayer intelligent contract
lib/
  genlayer/             # Client, types, network config
```
