import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  MAJOR_CHIPS,
  TIMELINE_OPTIONS,
  YEAR_LEVELS,
  type ResumeAudit,
  type ResumeStrength,
  type TimelineOption,
  type YearLevel,
} from "@/lib/student-types";

export interface ParsedResumeProfile {
  year: YearLevel | "";
  major: string;
  majorCustom?: string;
  school?: string;
  location?: string;
  skills?: string;
  timeline: TimelineOption | "";
  audit: ResumeAudit;
}

const YEAR_SET = new Set<string>(YEAR_LEVELS);
const MAJOR_SET = new Set<string>(MAJOR_CHIPS);
const TIMELINE_SET = new Set<string>(TIMELINE_OPTIONS);
const STRENGTH_SET = new Set<string>(["weak", "developing", "strong"]);

const PARSE_PROMPT = `You are a concise resume reviewer for a student opportunity app.

From this resume, extract profile fields and a brief experience audit.

Rules:
- year must be one of: Freshman, Sophomore, Junior, Senior, Grad student, or empty string if unclear
- major must be one of: Computer Science, Engineering, Business, Biology, Design, Other
- If major is Other, put the specific field in majorCustom
- timeline must be one of: This week, This month, This summer (guess intent from graduation date if needed)
- audit.strength: weak = little/no projects, internships, or leadership; developing = some but thin; strong = solid projects + experience
- audit.summary: ONE sentence, plain language
- audit.gaps: max 2 short strings (e.g. "No internships listed")
- audit.suggestedFocus: ONE sentence on what to prioritize next

Respond with ONLY valid JSON, no markdown:
{
  "year": "",
  "major": "",
  "majorCustom": "",
  "school": "",
  "location": "",
  "skills": "",
  "timeline": "",
  "audit": {
    "strength": "developing",
    "summary": "",
    "gaps": [],
    "suggestedFocus": ""
  }
}`;

function normalizeMajor(raw: string, majorCustom?: string): {
  major: string;
  majorCustom?: string;
} {
  const trimmed = raw.trim();
  if (MAJOR_SET.has(trimmed)) {
    return { major: trimmed, majorCustom: trimmed === "Other" ? majorCustom?.trim() : undefined };
  }

  const lower = trimmed.toLowerCase();
  if (lower.includes("computer") || lower.includes("software") || lower.includes("cs")) {
    return { major: "Computer Science" };
  }
  if (lower.includes("engineer")) return { major: "Engineering" };
  if (lower.includes("business") || lower.includes("finance")) return { major: "Business" };
  if (lower.includes("bio")) return { major: "Biology" };
  if (lower.includes("design") || lower.includes("ux")) return { major: "Design" };

  return { major: "Other", majorCustom: majorCustom?.trim() || trimmed || undefined };
}

function sanitizeParsed(raw: Record<string, unknown>): ParsedResumeProfile {
  const yearRaw = String(raw.year ?? "").trim();
  const year = YEAR_SET.has(yearRaw) ? (yearRaw as YearLevel) : "";

  const majorRaw = String(raw.major ?? "").trim();
  const majorCustomRaw = String(raw.majorCustom ?? "").trim();
  const { major, majorCustom } = normalizeMajor(majorRaw, majorCustomRaw);

  const timelineRaw = String(raw.timeline ?? "").trim();
  const timeline = TIMELINE_SET.has(timelineRaw)
    ? (timelineRaw as TimelineOption)
    : "This month";

  const auditRaw = (raw.audit ?? {}) as Record<string, unknown>;
  const strengthRaw = String(auditRaw.strength ?? "developing").trim();
  const strength = STRENGTH_SET.has(strengthRaw)
    ? (strengthRaw as ResumeStrength)
    : "developing";

  const gaps = Array.isArray(auditRaw.gaps)
    ? auditRaw.gaps.map((g) => String(g).trim()).filter(Boolean).slice(0, 2)
    : [];

  return {
    year,
    major,
    majorCustom,
    school: String(raw.school ?? "").trim() || undefined,
    location: String(raw.location ?? "").trim() || undefined,
    skills: String(raw.skills ?? "").trim() || undefined,
    timeline,
    audit: {
      strength,
      summary: String(auditRaw.summary ?? "Resume reviewed.").trim(),
      gaps,
      suggestedFocus: String(auditRaw.suggestedFocus ?? "").trim() || "Build one strong project this month.",
    },
  };
}

export async function parseResumePdf(
  buffer: Buffer,
  mimeType: string,
): Promise<ParsedResumeProfile> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Resume parsing is not configured. Continue without resume or add GEMINI_API_KEY.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      maxOutputTokens: 320,
      temperature: 0.2,
    },
  });

  const base64 = buffer.toString("base64");
  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    { text: PARSE_PROMPT },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not read resume. Try a clearer PDF or continue without resume.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  return sanitizeParsed(parsed);
}
