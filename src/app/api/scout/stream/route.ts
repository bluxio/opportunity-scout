import { OpportunityScoutWorkflow } from "@/lib/agent/workflow";
import type { SearchParams, WorkflowEvent } from "@/lib/types";
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
  const body = await request.json();
  const params = validateParams(body);

  if (typeof params === "string") {
    return NextResponse.json({ error: params }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const workflow = new OpportunityScoutWorkflow();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: WorkflowEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      };

      try {
        await workflow.run(params, send);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Stream failed";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
