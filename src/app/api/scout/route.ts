import { OpportunityScoutWorkflow } from "@/lib/agent/workflow";
import { listSearchSessions } from "@/lib/db";
import type { SearchParams } from "@/lib/types";
import { OPPORTUNITY_CATEGORIES } from "@/lib/types";
import { NextResponse } from "next/server";

function validateParams(body: unknown): SearchParams | string {
  if (!body || typeof body !== "object") {
    return "Invalid request body";
  }

  const { location, radius, categories, intent } = body as Record<string, unknown>;

  if (typeof location !== "string" || location.trim().length < 2) {
    return "Location is required";
  }

  if (typeof radius !== "number" || radius < 1 || radius > 100) {
    return "Radius must be between 1 and 100 miles";
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return "Select at least one category";
  }

  const validCategories = categories.filter((c) =>
    OPPORTUNITY_CATEGORIES.includes(c as (typeof OPPORTUNITY_CATEGORIES)[number]),
  );

  if (validCategories.length === 0) {
    return "No valid categories selected";
  }

  return {
    location: location.trim(),
    radius,
    categories: validCategories as SearchParams["categories"],
    intent: typeof intent === "string" ? intent.trim() : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const params = validateParams(body);

    if (typeof params === "string") {
      return NextResponse.json({ error: params }, { status: 400 });
    }

    const workflow = new OpportunityScoutWorkflow();
    const session = await workflow.run(params);

    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const sessions = await listSearchSessions(8);
  return NextResponse.json({ sessions });
}
