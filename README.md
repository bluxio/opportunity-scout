# Opp Scout

**Find underrated opportunities before everyone else does.**

Opp Scout is a searchable, filterable opportunity database for students — internships, startup roles, hackathons, fellowships, scholarships, research, paid gigs, local jobs, and campus opportunities in one place. Personalization and Top 5 recommendations sit on top of the feed.

**Live demo:** [opportunity-scout-ivory.vercel.app](https://opportunity-scout-ivory.vercel.app)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Product model

**Database first. Personalization second.**

- **Opportunity feed** — 50+ specific, actionable listings (not platform directories)
- **Category + filter chips** — browse by type, deadline, paid, remote, AI, etc.
- **Recommended for you** — Top 5 from the same database, personalized via local profile
- **Save / dismiss** — stored in browser localStorage
- **Submit an opportunity** — community submissions saved locally

Sources like Devpost or company career pages appear as *“Found via …”* on each card — not as the card itself.

## Legacy / hackathon backend

The ADK agent, `/api/scout`, MongoDB MCP, and resume parse API remain intact under `agent/` and `src/app/api/`. The main student UI is `src/components/opportunity-feed-app.tsx`.

## Environment (optional)

Copy `.env.example` to `.env.local` for Next.js API features:

```bash
GEMINI_API_KEY=   # optional — AI enrichment on /api/scout
MONGODB_URI=      # optional — direct session persistence
```

Agent env: copy `agent/.env.example` → `agent/.env` for ADK + MCP workflows.

## Project structure

```text
src/                    # Next.js app (student UI)
src/lib/                # scoring, mock opportunities, profile storage
agent/                  # Python ADK agent + MongoDB MCP tools
```

---

## Hackathon repro (Google Cloud Rapid Agent — MongoDB track)

**Stack:** ADK agent → `run_opportunity_scout` → MongoDB MCP `insert-many` → Atlas `search_sessions`

### 1. Next.js API (optional — powers agent scout tool)

```bash
npm install
npm run dev
```

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

## License

MIT — see [LICENSE](LICENSE).
