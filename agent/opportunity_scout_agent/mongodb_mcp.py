"""MongoDB MCP client helpers — calls mongodb-mcp-server via MCP protocol."""

from __future__ import annotations

import asyncio
import concurrent.futures
import json
import os
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


def _require_uri() -> str:
    uri = os.environ.get("MONGODB_URI", "").strip()
    if not uri:
        raise ValueError("MONGODB_URI is required (Atlas connection string)")
    return uri


def database_name() -> str:
    return os.environ.get("MONGODB_DB", "opportunity_scout")


def server_params() -> StdioServerParameters:
    return StdioServerParameters(
        command="npx",
        args=["-y", "mongodb-mcp-server"],
        env={
            **os.environ,
            "MDB_MCP_CONNECTION_STRING": _require_uri(),
        },
    )


async def insert_session_via_mcp_async(session: dict[str, Any]) -> dict[str, Any]:
    """Call MongoDB MCP insert-many to persist a SearchSession."""
    outcome: dict[str, Any] | None = None
    try:
        async with stdio_client(server_params()) as (read, write):
            async with ClientSession(read, write) as mcp_session:
                await mcp_session.initialize()
                result = await mcp_session.call_tool(
                    "insert-many",
                    arguments={
                        "database": database_name(),
                        "collection": "search_sessions",
                        "documents": [session],
                    },
                )

                content = [
                    block.model_dump() if hasattr(block, "model_dump") else str(block)
                    for block in (result.content or [])
                ]
                outcome = {
                    "status": "saved",
                    "database": database_name(),
                    "collection": "search_sessions",
                    "session_id": session.get("id"),
                    "mcp_content": content,
                }
    except BaseException:
        # mongodb-mcp-server stdio shutdown can raise after a successful insert.
        if outcome is not None:
            return outcome
        raise

    if outcome is None:
        raise RuntimeError("MongoDB MCP insert did not complete")
    return outcome


def insert_session_via_mcp(session: dict[str, Any]) -> dict[str, Any]:
    """Sync wrapper for ADK function tools and direct scripts.

    Direct scripts (no running loop): uses asyncio.run() as before.
    ADK tool calls (loop already running): runs MCP I/O in a worker thread
    with its own asyncio.run(), avoiding nested-loop RuntimeError.
    """
    def _run_in_new_loop() -> dict[str, Any]:
        return asyncio.run(insert_session_via_mcp_async(session))

    try:
        asyncio.get_running_loop()
    except RuntimeError:
        outcome = _run_in_new_loop()
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            outcome = executor.submit(_run_in_new_loop).result()

    print("\n--- MongoDB MCP insert-many ---")
    print(json.dumps(outcome, indent=2))
    return outcome


def get_mongodb_mcp_toolset():
    """ADK MCPToolset — exposes insert-many from mongodb-mcp-server to the agent."""
    from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
    from google.adk.tools.mcp_tool.mcp_toolset import McpToolset

    return McpToolset(
        connection_params=StdioConnectionParams(
            server_params=server_params(),
            timeout=60.0,
        ),
        tool_filter=["insert-many"],
    )
