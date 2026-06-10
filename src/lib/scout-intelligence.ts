import type { OpportunityCategory, ScoredOpportunity } from "@/lib/types";
import { formatCategory } from "@/lib/utils";

const NATIONAL_CHAINS = new Set([
  "Target",
  "Kohl's",
  "Walmart",
  "Starbucks",
  "Chipotle",
  "Panera Bread",
  "Best Buy",
  "Petco",
  "Verizon",
  "AT&T",
  "Apple Store",
  "H-E-B",
  "Kroger",
  "Ulta Beauty",
  "Sephora",
  "Planet Fitness",
  "Orangetheory",
  "Raising Cane's",
  "Torchy's Tacos",
  "Whataburger",
  "Chick-fil-A Allen",
]);

const HOSPITALITY_CATEGORIES: OpportunityCategory[] = [
  "restaurant",
  "customer_service",
];

export interface OverlookedEmployer {
  company: string;
  openingCount: number;
  distanceMiles: number;
  roles: string[];
}

interface IntelligenceInput {
  opportunities: ScoredOpportunity[];
  categories: OpportunityCategory[];
  radius: number;
  location: string;
  strongMatchThreshold?: number;
}

export function findMostOverlookedEmployer(
  opportunities: ScoredOpportunity[],
): OverlookedEmployer | null {
  if (opportunities.length < 2) return null;

  const byCompany = opportunities.reduce(
    (acc, o) => {
      if (!acc[o.company]) {
        acc[o.company] = { roles: [], distanceMiles: o.distanceMiles };
      }
      acc[o.company].roles.push(o.title);
      acc[o.company].distanceMiles = Math.min(
        acc[o.company].distanceMiles,
        o.distanceMiles,
      );
      return acc;
    },
    {} as Record<string, { roles: string[]; distanceMiles: number }>,
  );

  const ranked = Object.entries(byCompany)
    .map(([company, data]) => ({
      company,
      openingCount: data.roles.length,
      distanceMiles: data.distanceMiles,
      roles: data.roles,
      isLocal: !NATIONAL_CHAINS.has(company),
    }))
    .filter((e) => e.openingCount >= 2)
    .sort((a, b) => {
      if (b.openingCount !== a.openingCount) return b.openingCount - a.openingCount;
      if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1;
      return a.distanceMiles - b.distanceMiles;
    });

  const top = ranked[0];
  if (!top) return null;

  return {
    company: top.company,
    openingCount: top.openingCount,
    distanceMiles: top.distanceMiles,
    roles: top.roles,
  };
}

export function buildScoutIntelligence({
  opportunities,
  categories,
  radius,
  location,
  strongMatchThreshold = 82,
}: IntelligenceInput): string[] {
  if (opportunities.length === 0) return [];

  const observations: string[] = [];
  const city = location.split(",")[0]?.trim() || location;

  observations.push(
    "Most opportunities were discovered directly from employer career pages rather than traditional job-search workflows.",
  );

  const byCategory = countByCategory(opportunities);
  const hospitalityCount = HOSPITALITY_CATEGORIES.reduce(
    (sum, cat) => sum + (byCategory[cat] ?? 0),
    0,
  );
  const retailCount = byCategory.retail ?? 0;

  if (hospitalityCount > 0 && retailCount > 0) {
    if (hospitalityCount > retailCount) {
      observations.push(
        `In this search, restaurant and hospitality employers appear to be posting more openings than retail employers near ${city}.`,
      );
    } else if (retailCount > hospitalityCount) {
      observations.push(
        `In this search, retail employers appear to be posting more openings than restaurant and hospitality employers near ${city}.`,
      );
    }
  } else if (hospitalityCount >= 2 && categories.includes("restaurant")) {
    observations.push(
      `Restaurant and hospitality openings make up most of what surfaced near ${city}.`,
    );
  }

  const closeRadius = Math.min(6, radius * 0.4);
  const strongClose = opportunities.filter(
    (o) =>
      o.fitScore >= strongMatchThreshold && o.distanceMiles <= closeRadius,
  );

  if (strongClose.length >= 2) {
    observations.push(
      `The strongest matches in this search are concentrated within about ${closeRadius} miles of your location.`,
    );
  }

  const overlooked = findMostOverlookedEmployer(opportunities);
  if (overlooked && overlooked.openingCount >= 2) {
    observations.push(
      `Multiple roles surfaced from ${overlooked.company} — an employer most applicants wouldn't monitor directly.`,
    );
  }

  const localCount = opportunities.filter(
    (o) => !NATIONAL_CHAINS.has(o.company),
  ).length;
  const chainCount = opportunities.length - localCount;

  if (localCount >= 2 && localCount > chainCount) {
    observations.push(
      "Local employers account for more of the surfaced openings than national chains in this search.",
    );
  }

  return observations.slice(0, 4);
}

function countByCategory(
  opportunities: ScoredOpportunity[],
): Partial<Record<OpportunityCategory, number>> {
  return opportunities.reduce(
    (acc, o) => {
      acc[o.category] = (acc[o.category] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<OpportunityCategory, number>>,
  );
}

export function buildSurfacedSignals(
  opportunity: ScoredOpportunity,
  categories: OpportunityCategory[],
  radius: number,
): string[] {
  const signals: string[] = [
    "Direct employer posting",
    "Hiring now",
  ];

  if (opportunity.distanceMiles <= radius * 0.4) {
    signals.push("Close to your location");
  }

  if (categories.includes(opportunity.category)) {
    signals.push("Matches selected categories");
  }

  const discoveredMs = Date.now() - new Date(opportunity.discoveredAt).getTime();
  if (discoveredMs < 1000 * 60 * 60) {
    signals.push("Recently discovered");
  }

  return signals;
}
