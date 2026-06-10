from typing import Any

from opportunity_scout_agent.mongodb_mcp import insert_session_via_mcp


def save_scout_session_mcp(session: dict[str, Any]) -> dict[str, Any]:
    """Save a SearchSession to MongoDB Atlas using the MongoDB MCP insert-many tool.

    Args:
        session: Complete SearchSession dict returned by run_opportunity_scout.

    Returns:
        Save result with status, database, collection, and session_id.
    """
    return insert_session_via_mcp(session)
