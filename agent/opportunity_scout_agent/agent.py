import os

from google.adk.agents.llm_agent import Agent

from .tools.save import save_scout_session_mcp
from .tools.scout import run_opportunity_scout

_tools = [run_opportunity_scout, save_scout_session_mcp]

if os.environ.get("MONGODB_URI"):
    from .mongodb_mcp import get_mongodb_mcp_toolset

    _tools.append(get_mongodb_mcp_toolset())

root_agent = Agent(
    model="gemini-2.5-flash",
    name="opportunity_scout_agent",
    description="Discovers local opportunities from employer career pages.",
    instruction=(
        "You are Opportunity Scout. When asked to scout for opportunities:\n"
        "1. Call run_opportunity_scout with location, radius, and categories.\n"
        "2. Call save_scout_session_mcp with the full SearchSession dict from step 1.\n"
        "3. Confirm how many opportunities were discovered and that the session was saved.\n"
        "Defaults if unspecified: location='Allen, TX', radius=15, "
        "categories=['restaurant', 'retail']."
    ),
    tools=_tools,
)
