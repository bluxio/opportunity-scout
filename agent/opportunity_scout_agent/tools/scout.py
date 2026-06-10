import json
import os

import httpx


def run_opportunity_scout(
    location: str,
    radius: int,
    categories: list[str],
    intent: str = "",
) -> dict:
    """Runs the Opportunity Scout workflow via the existing Next.js API.

    Calls POST /api/scout and returns the complete SearchSession JSON.

    Args:
        location: City and state, e.g. "Allen, TX".
        radius: Search radius in miles (1-100).
        categories: Opportunity categories, e.g. ["restaurant", "retail"].
        intent: Optional user intent string.

    Returns:
        SearchSession dict with id, params, status, steps, opportunities,
        employerResearch, report, createdAt, and completedAt.
    """
    base_url = os.environ.get(
        "OPPORTUNITY_SCOUT_API_URL", "http://localhost:3000"
    ).rstrip("/")

    payload: dict = {
        "location": location,
        "radius": radius,
        "categories": categories,
    }
    if intent:
        payload["intent"] = intent

    response = httpx.post(
        f"{base_url}/api/scout",
        json=payload,
        timeout=180.0,
    )
    response.raise_for_status()
    session: dict = response.json()

    print("\n--- SearchSession ---")
    print(json.dumps(session, indent=2))

    return session
