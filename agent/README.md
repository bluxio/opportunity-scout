# Opportunity Scout — ADK POC

**ADK → `run_opportunity_scout` → SearchSession → MongoDB MCP `insert-many` → Atlas**

## Prerequisites

1. Next.js running: `npm run dev` (repo root)
2. Python 3.10+
3. Node.js + `npx` (for `mongodb-mcp-server`)
4. [Gemini API key](https://aistudio.google.com/apikey)
5. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster + connection string

## Setup

```bash
cd agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — GOOGLE_API_KEY, MONGODB_URI, MONGODB_DB
```

**Atlas tip:** Network Access → allow your IP (or `0.0.0.0/0` for hackathon demo).

## Verify MongoDB MCP (no Gemini)

```bash
python run_scout_mcp_direct.py
```

Expected:
1. SearchSession JSON printed
2. `MongoDB MCP insert-many` success message
3. Document visible in Atlas → `opportunity_scout` → `search_sessions`

## Verify full ADK flow

```bash
python run_adk_mcp_poc.py
```

Agent calls `run_opportunity_scout`, then `save_scout_session_mcp`.

## Architecture

```
ADK Agent
  ├── run_opportunity_scout()     → POST /api/scout (existing Next.js)
  ├── save_scout_session_mcp()    → mongodb-mcp-server via MCP insert-many
  └── MCPToolset (insert-many)    → exposed when MONGODB_URI is set
```

## Files

```
agent/
  opportunity_scout_agent/
    agent.py              # root_agent + tools
    mongodb_mcp.py        # MCP client + MCPToolset factory
    tools/
      scout.py            # run_opportunity_scout
      save.py             # save_scout_session_mcp
  run_scout_mcp_direct.py # scout + MCP (no Gemini)
  run_adk_mcp_poc.py      # full ADK flow
```
