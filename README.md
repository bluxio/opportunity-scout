# Opp Scout

**Find the opportunities actually worth your time.**

Opp Scout is a decision engine for students — not a search engine. Pick a goal, share a few details, and get a ranked shortlist of internships, hackathons, scholarships, research roles, fellowships, startup opportunities, and paid gigs.

**Live demo:** [opportunity-scout-ivory.vercel.app](https://opportunity-scout-ivory.vercel.app)

## One-sentence pitch

> Opp Scout ranks the opportunities actually worth your time based on your goals — so you know what to do this week, not just what exists.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Pick a goal** — internship, AI, resume, summer income, research, scholarships, startup, or "I'm not sure"
2. **Quick profile** — school, major, graduation year, location, skills (stored locally in your browser)
3. **Get your Top 5 Moves This Week** — ranked cards with score, deadline, effort, upside, why it fits, and a clear next action

## What each result includes

| Field | What it tells you |
|-------|-------------------|
| **Opportunity Score** | Fit + upside + urgency + accessibility − effort |
| **Why it fits** | Personalized to your goal and background |
| **Estimated upside** | What you gain if it works |
| **Estimated effort** | Time cost to apply or participate |
| **Deadline** | When to act |
| **Next action** | The single step to take now |

## Demo script (2 minutes)

1. Open the app — "Most students drown in listings. This tells you what to do."
2. Select **Break into AI** (or any goal)
3. Fill profile — e.g. CS major, Class of 2027, Dallas TX
4. Show **Your Top 5 Moves This Week**
5. Walk through #1 — score, why it fits, next action, source link
6. Mention: ranked from goal + profile, not endless scrolling

## Scoring

```text
OpportunityScore = Fit + Upside + Urgency + Accessibility - Effort
```

Implemented in `src/lib/opportunity-score.ts`. Mock data and weights in `src/lib/mock-student-opportunities.ts` — easy to tune.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js · TypeScript · Tailwind |
| Student ranking | Mock dataset + local profile (`localStorage`) |
| Agent backend | Python ADK · Gemini · MongoDB MCP · Atlas |

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
