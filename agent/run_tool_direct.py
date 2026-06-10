#!/usr/bin/env python3
"""Step 1: Verify the tool calls POST /api/scout (no ADK, no Gemini key)."""

from opportunity_scout_agent.tools.scout import run_opportunity_scout


def main() -> None:
    session = run_opportunity_scout(
        location="Allen, TX",
        radius=15,
        categories=["restaurant", "retail"],
        intent="Part-time work near Allen",
    )
    print(f"\nOK: {session['status']} — {len(session['opportunities'])} opportunities")


if __name__ == "__main__":
    main()
