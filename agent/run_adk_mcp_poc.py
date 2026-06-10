#!/usr/bin/env python3
"""ADK agent: scout → MongoDB MCP save."""

import asyncio
import os
import sys

from dotenv import load_dotenv

load_dotenv()

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from opportunity_scout_agent import root_agent


async def main() -> None:
    if not os.environ.get("GOOGLE_API_KEY"):
        print("Set GOOGLE_API_KEY in agent/.env")
        sys.exit(1)
    if not os.environ.get("MONGODB_URI"):
        print("Set MONGODB_URI in agent/.env")
        sys.exit(1)

    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        app_name="opportunity_scout_mcp",
        session_service=session_service,
    )

    user_id = "poc_user"
    adk_session_id = "poc_session"

    await session_service.create_session(
        app_name="opportunity_scout_mcp",
        user_id=user_id,
        session_id=adk_session_id,
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    "Scout for opportunities near Allen, TX within 15 miles "
                    "for restaurant and retail, then save the session to MongoDB."
                )
            )
        ],
    )

    print("Running ADK agent (scout + MCP save)...\n")

    async for event in runner.run_async(
        user_id=user_id,
        session_id=adk_session_id,
        new_message=message,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    print(f"[agent] {part.text[:300]}")

    print("\nDone. Verify search_sessions in MongoDB Atlas.")


if __name__ == "__main__":
    asyncio.run(main())
