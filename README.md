# Opportunity Scout

**Opportunity Scout researches dozens of local employers and surfaces opportunities discovered directly from employer career pages that users would likely miss through traditional job-search workflows.**

Not a job board. Not an auto-apply bot. An opportunity discovery agent.

## One-sentence pitch

> There are opportunities around you that you would never have found manually — because they only live on employer career pages, not where everyone else is searching.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo search:** `Part-time work near Allen, TX` · restaurant + retail · 15 mi

## What you'll see

1. **Summary** — opportunities discovered, direct employer postings, strong matches
2. **Scout Intelligence** — pattern observations (category trends, proximity, overlooked employers)
3. **Most overlooked employer** — e.g. North Italia with multiple active openings
4. **Discovered opportunities** — each with "Why it surfaced" signals
5. **How these were found** — collapsed research trace (mechanism, not the hero)

## Demo script (2 minutes)

1. Open the app — explain the problem: job boards miss local employer career pages
2. Enter intent: "Part-time work near Allen, TX"
3. Click **Start scouting** — watch summary stats build live
4. Point to **Scout Intelligence** — "research → analysis → results"
5. Highlight **Most overlooked employer** — North Italia, 2 openings, miles away
6. Walk through one **Discovered opportunity** — "Why it surfaced" shows agent reasoning
7. Expand **How these were found** only if asked about the mechanism

## Architecture

```typescript
interface OpportunityProvider {
  discoverEmployers()
  findCareerPage()
  fetchOpportunities()
}
```

| Provider | Status |
|----------|--------|
| `MockProvider` | Full demo (Allen-area employers) |
| `GreenhouseProvider` | Public API ready |
| `LeverProvider` | Public API ready |
| `WorkdayProvider` | Placeholder |
| `CustomCareerPageProvider` | Placeholder |

Greenhouse, Lever, Workday, and custom career pages are implementation details — the product is employer discovery, not ATS integration.

## Environment

Copy `.env.example` to `.env.local`:

```bash
GEMINI_API_KEY=          # optional — AI enrichment
MONGODB_URI=             # optional — persist scout reports
GREENHOUSE_BOARD_TOKEN=  # optional — live Greenhouse provider
LEVER_COMPANY_SLUG=      # optional — live Lever provider
```

## Tech stack

- Next.js App Router · TypeScript · Tailwind
- Python ADK agent · Gemini API · MongoDB MCP · MongoDB Atlas
- SSE streaming for live scout updates

## Hackathon repro (Google Cloud Rapid Agent — MongoDB track)

**Stack:** ADK agent → `run_opportunity_scout` → MongoDB MCP `insert-many` → Atlas `search_sessions`

### 1. Next.js UI

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. ADK agent + MongoDB MCP

```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env: MONGODB_URI, GOOGLE_API_KEY, OPPORTUNITY_SCOUT_API_URL=http://localhost:3000
```

**MCP insert (no Gemini):**

```bash
python run_scout_mcp_direct.py
```

**Full ADK orchestration (Next.js must be running):**

```bash
python run_adk_mcp_poc.py
```

### 3. Verify Atlas

MongoDB Atlas → `opportunity_scout` → `search_sessions` → confirm session document with matching `id`.

