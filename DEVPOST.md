# Devpost submission copy

**Hackathon:** [Google Cloud Rapid Agent Hackathon](https://rapid-agent.devpost.com/)  
**Partner track:** MongoDB  
**Deadline:** Jun 11, 2026 @ 2:00pm PDT

## Project title

Opportunity Scout

## Elevator pitch

ADK agent that discovers local job opportunities from employer career pages and persists scout sessions to MongoDB Atlas via the MongoDB MCP server.

## Description

Opportunity Scout is an AI agent that researches local employers, extracts opportunities from their career pages, and saves complete scout sessions to MongoDB Atlas using MCP.

**Multi-step agent flow:**
1. ADK agent receives scout request
2. `run_opportunity_scout` calls the Next.js workflow API
3. `save_scout_session_mcp` inserts the SearchSession via `mongodb-mcp-server`
4. Session persisted in Atlas `opportunity_scout.search_sessions`

**Built with:** Google ADK, Gemini, MongoDB MCP, MongoDB Atlas, Next.js

## URLs (fill after deploy)

- **Repository:** https://github.com/bluxio/opportunity-scout
- **Demo:** https://opportunity-scout-ivory.vercel.app
- **Video:** (YouTube URL)

## Built with

Google ADK, Gemini API, MongoDB MCP Server, MongoDB Atlas, Next.js, TypeScript

## MongoDB MCP integration

Uses `mongodb-mcp-server` via MCP protocol. The ADK tool `save_scout_session_mcp` calls `insert-many` on database `opportunity_scout`, collection `search_sessions`.

## Demo video checklist (~3 min)

1. Problem statement (15s)
2. Live UI demo — Allen, TX search (40s)
3. Terminal — `python run_adk_mcp_poc.py` showing SearchSession + MCP save (45s)
4. Atlas — browse `search_sessions` document (30s)
5. GitHub repo + MIT license (20s)
6. Closing one-liner (10s)

Upload unlisted to YouTube, paste URL into Devpost.
