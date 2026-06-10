#!/usr/bin/env python3
"""Scout + MongoDB MCP insert (no Gemini). Verify document in Atlas."""

import os
import sys

from dotenv import load_dotenv

load_dotenv()

from opportunity_scout_agent.tools.save import save_scout_session_mcp
from opportunity_scout_agent.tools.scout import run_opportunity_scout


def main() -> None:
    if not os.environ.get("MONGODB_URI"):
        print("Set MONGODB_URI in agent/.env (Atlas connection string)")
        sys.exit(1)

    print("Step 1: run_opportunity_scout → POST /api/scout\n")
    session = run_opportunity_scout(
        location="Allen, TX",
        radius=15,
        categories=["restaurant", "retail"],
        intent="Part-time work near Allen",
    )

    print("\nStep 2: save_scout_session_mcp → MongoDB MCP insert-many\n")
    result = save_scout_session_mcp(session)

    print(
        f"\nDone. Check Atlas → {result['database']} → search_sessions "
        f"for id={result['session_id']}"
    )


if __name__ == "__main__":
    main()
