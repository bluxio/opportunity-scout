import { parseResumePdf } from "@/lib/resume-audit";
import { NextResponse } from "next/server";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 4MB)." }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    const name = file.name.toLowerCase();

    if (!name.endsWith(".pdf") && mimeType !== "application/pdf") {
      return NextResponse.json(
        {
          error:
            "PDF only for auto-read right now. Export as PDF or continue without resume.",
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const profile = await parseResumePdf(buffer, "application/pdf");

    return NextResponse.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse resume.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
