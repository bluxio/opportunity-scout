#!/usr/bin/env python3
"""Step 2: Verify ADK agent invokes run_opportunity_scout tool."""

import asyncio
import os
import sys

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from opportunity_scout_agent import root_agent


async def main() -> None:
    if not os.environ.get("GOOGLE_API_KEY"):
        print("Set GOOGLE_API_KEY in agent/.env (see .env.example)")
        sys.exit(1)

    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        app_name="opportunity_scout_poc",
        session_service=session_service,
    )

    user_id = "poc_user"
    session_id = "poc_session"

    await session_service.create_session(
        app_name="opportunity_scout_poc",
        user_id=user_id,
        session_id=session_id,
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    "Scout for opportunities near Allen, TX within 15 miles. "
                    "Categories: restaurant and retail."
                )
            )
        ],
    )

    print("Running ADK agent — watch for SearchSession printed by tool...\n")

    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=message,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    print(f"[agent] {part.text[:200]}")

    print("\nDone. If SearchSession JSON appeared above, ADK → tool → API works.")


if __name__ == "__main__":
    asyncio.run(main())
