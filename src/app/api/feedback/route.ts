import { saveUserFeedback, summarizeUserFeedback } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const key = request.headers.get("x-feedback-key");
  const expected = process.env.FEEDBACK_READ_KEY;

  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await summarizeUserFeedback();
  if (!summary) {
    return NextResponse.json({
      error: "No database configured. Check localStorage opp-scout-feedback-log in browser.",
    }, { status: 503 });
  }

  return NextResponse.json(summary);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const bucket = String(body.bucket ?? "");
    const pursued = Array.isArray(body.pursued) ? body.pursued.map(String) : [];
    const skipped = Array.isArray(body.skipped) ? body.skipped.map(String) : [];
    const note = String(body.note ?? "").trim().slice(0, 500);
    const topMoves = Array.isArray(body.topMoves)
      ? body.topMoves.map((m) => String(m))
      : [];

    const payload = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      bucket,
      pursued,
      skipped,
      note: note || undefined,
      topMoves,
    };

    const stored = await saveUserFeedback(payload);
    return NextResponse.json({ ok: true, stored });
  } catch {
    return NextResponse.json({ error: "Could not save feedback." }, { status: 500 });
  }
}
