import { GoogleGenerativeAI } from "@google/generative-ai";
import type { RawOpportunity, SearchParams, ScoredOpportunity } from "@/lib/types";
import type { Employer } from "@/lib/types";

interface AiEnrichment {
  fitScore: number;
  recommendation: string;
  surfacedReason: string;
}

function buildEmployerMap(employers: Employer[]): Map<string, Employer> {
  return new Map(employers.map((e) => [e.id, e]));
}

const HERO_MATCHES: Record<string, string[]> = {
  "North Italia": ["Host"],
  "Mexican Sugar": ["Host"],
};

function mockEnrichment(
  opportunity: RawOpportunity,
  employer: Employer,
  params: SearchParams,
): AiEnrichment {
  const isHeroMatch =
    HERO_MATCHES[employer.name]?.includes(opportunity.title) ?? false;
  const categoryMatch = params.categories.includes(employer.category);
  const proximityBonus = employer.distanceMiles <= params.radius * 0.4 ? 8 : 0;
  const baseScore = isHeroMatch ? 88 : categoryMatch ? 68 : 55;
  const fitScore = Math.min(97, baseScore + proximityBonus);

  return {
    fitScore,
    recommendation: isHeroMatch
      ? "Strong match — you wouldn't have found this without scouting the employer directly."
      : "Worth a look — posted only on their careers page, not job boards.",
    surfacedReason: `Surfaced from the employer's careers page — outside traditional job-search workflows.`,
  };
}

async function enrichWithGemini(
  opportunity: RawOpportunity,
  employer: Employer,
  params: SearchParams,
): Promise<AiEnrichment> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return mockEnrichment(opportunity, employer, params);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are Opportunity Scout, an AI scout that helps users find opportunities they would NOT discover on Indeed or LinkedIn. You surface roles found only on employer career pages.

User search:
- Location: ${params.location}
- Radius: ${params.radius} miles
- Categories: ${params.categories.join(", ")}

Employer:
- Name: ${employer.name}
- Category: ${employer.category}
- Distance: ${employer.distanceMiles} miles
- Career page: ${employer.careerPageUrl}

Opportunity:
- Title: ${opportunity.title}
- Location: ${opportunity.location}
- Description: ${opportunity.description ?? "N/A"}

Respond with ONLY valid JSON (no markdown):
{
  "fitScore": <number 0-100>,
  "recommendation": "<one sentence actionable advice>",
  "surfacedReason": "<one sentence explaining why this was surfaced>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]) as AiEnrichment;
    return {
      fitScore: Math.min(100, Math.max(0, Math.round(parsed.fitScore))),
      recommendation: parsed.recommendation,
      surfacedReason: parsed.surfacedReason,
    };
  } catch {
    return mockEnrichment(opportunity, employer, params);
  }
}

export function enrichOpportunityQuick(
  opportunity: RawOpportunity,
  employer: Employer,
  params: SearchParams,
  index: number,
): ScoredOpportunity {
  const ai = mockEnrichment(opportunity, employer, params);
  return {
    id: `${employer.id}-${index}`,
    company: employer.name,
    title: opportunity.title,
    location: opportunity.location,
    applyLink: opportunity.applyUrl,
    discoveredAt: new Date().toISOString(),
    fitScore: ai.fitScore,
    recommendation: ai.recommendation,
    surfacedReason: ai.surfacedReason,
    category: employer.category,
    employerWebsite: employer.website,
    platform: employer.platform ?? "custom",
    distanceMiles: employer.distanceMiles,
  };
}

export async function enrichOpportunities(
  raw: RawOpportunity[],
  employers: Employer[],
  params: SearchParams,
): Promise<ScoredOpportunity[]> {
  const employerMap = buildEmployerMap(employers);
  const discoveredAt = new Date().toISOString();

  const enriched = await Promise.all(
    raw.map(async (opportunity, index) => {
      const employer = employerMap.get(opportunity.employerId);
      if (!employer) {
        throw new Error(`Unknown employer: ${opportunity.employerId}`);
      }

      const ai = await enrichWithGemini(opportunity, employer, params);

      return {
        id: `${employer.id}-${index}`,
        company: employer.name,
        title: opportunity.title,
        location: opportunity.location,
        applyLink: opportunity.applyUrl,
        discoveredAt,
        fitScore: ai.fitScore,
        recommendation: ai.recommendation,
        surfacedReason: ai.surfacedReason,
        category: employer.category,
        employerWebsite: employer.website,
        platform: employer.platform ?? "custom",
        distanceMiles: employer.distanceMiles,
      } satisfies ScoredOpportunity;
    }),
  );

  return enriched.sort((a, b) => b.fitScore - a.fitScore);
}
