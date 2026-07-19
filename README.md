# EchoCourt

Decentralized social-context arbitration protocol on GenLayer. A meaning court for online communities.

**Live:** [echocourt.vercel.app](https://echocourt.vercel.app)

## The Problem

Online communities face a gap between binary moderation (ban/allow) and the nuanced reality of human communication. When someone says something ambiguous, sarcastic, or culturally loaded, moderators are forced into black-and-white decisions that often frustrate both sides. There's no structured way to interpret *meaning* — only to punish or ignore.

This is a trust problem: community members don't trust that their words will be interpreted fairly, and moderators don't have tools to deliver nuanced, defensible decisions.

## What EchoCourt Does

EchoCourt lets communities submit disputes about meaning for structured interpretation. Instead of one moderator deciding, GenLayer's non-deterministic AI validators independently evaluate the case against the community's own charter (norms, tone expectations, remedy policies), then reach consensus.

The result isn't "guilty/not guilty" — it's a multi-dimensional verdict covering interpretation, intent, impact, context quality, charter alignment, and a recommended remedy. Both parties can appeal, and new evidence is re-evaluated on-chain.

**Key differentiator:** Validators fetch evidence URLs on-chain using `gl.get_webpage()` to verify claims against real web content. This isn't just an LLM giving opinions — it's verified, consensus-backed interpretation grounded in actual evidence.

## How to Use

### 1. Create a Community Charter

Navigate to **Charter** and define your community's rules:
- Community name and ID (e.g., `my-dao`)
- Allowed norms and forbidden behaviours
- Tone expectations and remedy policies
- Appeal policy and bond amount

This charter becomes the standard against which all cases are evaluated.

### 2. Open a Case

Go to **Open Case** and submit a dispute:
- Select your community ID (must match an existing charter)
- Describe what happened and why it violates community standards
- Add evidence: paste URLs (validators will fetch these on-chain) or upload screenshots
- Name the respondent (their wallet address)
- Request an outcome (mediation, warning, clarification, etc.)

### 3. Respondent Replies

The respondent connects their wallet, navigates to the case, and submits their side:
- Their statement explaining what happened
- Counter-evidence (URLs or screenshots)
- Context and mitigating factors

Only the named respondent can submit a response.

### 4. Request Interpretation

Either party triggers AI interpretation. Validators:
1. Load the community charter
2. Fetch all evidence URLs on-chain via `gl.get_webpage()`
3. Cross-reference claimed evidence against verified web content
4. Independently evaluate the case
5. Reach consensus on a multi-dimensional verdict

If the AI result can't be parsed, the case is flagged for human review automatically.

### 5. Read the Verdict

The verdict shows:
- Primary interpretation (e.g., careless_harm, no_violation, clear_violation)
- Impact level, intent assessment, context quality
- Charter alignment score
- Recommended remedy
- Confidence percentage and short reasoning

### 6. Appeal (Optional)

If either party disagrees, they can appeal with:
- Appeal basis (new evidence, procedural error, misinterpretation)
- Explanation of why the verdict is wrong
- New evidence (also verified on-chain)

The appeal is re-evaluated by validators who see both the original verdict and the appeal arguments.

## On-Chain Evidence Verification

When evidence includes HTTP/HTTPS URLs, validators call `gl.get_webpage(url, mode="text")` to fetch the actual page content during interpretation. This means:

- Claims are cross-referenced against real web content
- Validators aren't just trusting what parties say — they verify it
- The AI prompt explicitly instructs: "Cross-reference the claimed evidence against the verified web content"
- If no URLs are provided, the verdict notes that evidence is unverified and weighs it accordingly

This uses GenLayer's non-deterministic execution: each validator fetches the page independently, ensuring the evidence verification is part of the consensus process.

## Verdict Dimensions

Each verdict evaluates across 6 dimensions:

| Dimension | Possible Values |
|-----------|----------------|
| Primary Interpretation | no_violation, minor_norm_drift, contextual_misunderstanding, careless_harm, clear_violation, severe_violation, bad_faith_claim, insufficient_context |
| Impact Level | none, low, medium, high, severe, unclear |
| Intent Assessment | likely_benign, careless, reckless, targeted, manipulative, unclear |
| Context Quality | strong_context, partial_context, thin_context, conflicting_context, insufficient_context |
| Charter Alignment | aligned, borderline, misaligned, clearly_violated, not_applicable, unclear |
| Recommended Remedy | no_action, private_clarification, public_clarification, mediation, warning, apology_requested, temporary_restriction, removal_recommended, dismiss_claim, request_more_context |

## Access Control

- `submit_response` — Only the named respondent can respond
- `request_interpretation` — Only case parties (claimant or respondent) can trigger
- `appeal_case` — Only case parties can appeal
- `flag_for_human_review` — Only the charter creator can manually flag
- Human review fallback — If AI output fails to parse, case auto-flags for review

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Chain:** GenLayer StudioNet
- **Contract:** Python intelligent contract with `gl.get_webpage()` + `gl.eq_principle.prompt_comparative()`
- **SDK:** genlayer-js for contract interaction
- **Deployment:** Vercel (frontend), GenLayer StudioNet (contract)

## Contract

Deployed on GenLayer StudioNet:
```
0xD233bfF309f6C552A4Be41d7739b2D9a7C7717ED
```

Source: [`contracts/EchoCourt.py`](contracts/EchoCourt.py)

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `create_charter` | write | Register a community charter with norms and policies |
| `submit_case` | write | Open a new dispute case |
| `submit_response` | write | Respondent submits their side (respondent-only) |
| `request_interpretation` | write | Trigger AI interpretation with on-chain evidence fetching (parties-only) |
| `appeal_case` | write | Appeal a decided verdict (parties-only) |
| `resolve_appeal` | write | AI re-evaluates with appeal arguments and new evidence |
| `flag_for_human_review` | write | Charter creator flags a case for human review |
| `get_case` | view | Read case details |
| `get_verdict` | view | Read verdict for a case |
| `get_charter` | view | Read community charter |
| `get_community_cases` | view | List all cases for a community |
| `get_appeal` | view | Read appeal details |
| `get_stats` | view | Get total case count |

## Use Cases

- **DAOs** — Govern proposal disputes and contributor conflicts with charter-aligned interpretation
- **Creator Communities** — Handle content attribution and collaboration disagreements
- **Gaming Guilds** — Mediate toxicity reports with verified evidence from chat logs
- **Moderation Councils** — Provide structured, appealable interpretation for platform rules
- **Open Source Projects** — Resolve code of conduct disputes transparently

## Roadmap

- [ ] Multi-community dashboard with case analytics and trends
- [ ] Reputation system based on case outcomes and participation
- [ ] Notification system for case updates (email/push)
- [ ] Case templates for common dispute types
- [ ] Bulk evidence upload and document support
- [ ] Community-to-community charter forking
- [ ] Public case browser for transparency
- [ ] SDK for integrating EchoCourt into existing platforms (Discord bots, Telegram, forums)
- [ ] Arbitrator marketplace for human review escalation

## Development

```bash
npm install
npm run dev
```

Set your contract address in `.env.local`:
```
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xD233bfF309f6C552A4Be41d7739b2D9a7C7717ED
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

## License

MIT
