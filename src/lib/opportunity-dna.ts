import type { Opportunity, OpportunityCategory, OpportunityDNA } from "@/lib/opportunity-types";

/** 0–10 scale for each leverage dimension */
export type { OpportunityDNA };

export const DNA_DIMENSIONS = [
  { key: "money" as const, label: "Money" },
  { key: "network" as const, label: "Network" },
  { key: "resume" as const, label: "Resume" },
  { key: "prestige" as const, label: "Prestige" },
  { key: "experience" as const, label: "Experience" },
  { key: "effort" as const, label: "Effort" },
  { key: "competitiveness" as const, label: "Competitiveness" },
];

const CATEGORY_BASE: Record<
  OpportunityCategory,
  Omit<OpportunityDNA, "inPerson" | "remote" | "localToSchool" | "tags">
> = {
  internships: {
    money: 8,
    resume: 9,
    network: 6,
    prestige: 8,
    experience: 9,
    effort: 7,
    competitiveness: 8,
  },
  startup_roles: {
    money: 7,
    resume: 8,
    network: 7,
    prestige: 6,
    experience: 9,
    effort: 6,
    competitiveness: 7,
  },
  local_jobs: {
    money: 8,
    resume: 3,
    network: 2,
    prestige: 1,
    experience: 4,
    effort: 3,
    competitiveness: 2,
  },
  paid_gigs: {
    money: 9,
    resume: 2,
    network: 2,
    prestige: 1,
    experience: 3,
    effort: 2,
    competitiveness: 2,
  },
  hackathons: {
    money: 4,
    resume: 7,
    network: 5,
    prestige: 5,
    experience: 8,
    effort: 6,
    competitiveness: 5,
  },
  fellowships: {
    money: 1,
    resume: 8,
    network: 8,
    prestige: 7,
    experience: 8,
    effort: 5,
    competitiveness: 7,
  },
  scholarships: {
    money: 9,
    resume: 5,
    network: 3,
    prestige: 6,
    experience: 2,
    effort: 4,
    competitiveness: 7,
  },
  research: {
    money: 5,
    resume: 8,
    network: 6,
    prestige: 7,
    experience: 9,
    effort: 6,
    competitiveness: 7,
  },
  campus: {
    money: 7,
    resume: 3,
    network: 3,
    prestige: 2,
    experience: 4,
    effort: 2,
    competitiveness: 3,
  },
  programs: {
    money: 2,
    resume: 7,
    network: 7,
    prestige: 6,
    experience: 7,
    effort: 5,
    competitiveness: 6,
  },
};

/** Hand-curated DNA for well-known opportunities — overrides inference */
const DNA_OVERRIDES: Record<string, Partial<OpportunityDNA>> = {
  "codepath-tip-fall-2026": {
    money: 0,
    resume: 9,
    network: 8,
    prestige: 7,
    experience: 9,
    effort: 5,
    competitiveness: 6,
  },
  "colorstack-membership": {
    money: 0,
    resume: 6,
    network: 10,
    prestige: 8,
    experience: 4,
    effort: 2,
    competitiveness: 5,
  },
  "neo-scholars-2025": {
    money: 1,
    resume: 9,
    network: 10,
    prestige: 10,
    experience: 8,
    effort: 6,
    competitiveness: 10,
  },
  "tamu-dining-student-worker": {
    money: 8,
    resume: 3,
    network: 2,
    prestige: 1,
    experience: 4,
    effort: 2,
    competitiveness: 2,
    localToSchool: true,
  },
};

function clamp(n: number): number {
  return Math.min(10, Math.max(0, Math.round(n)));
}

function scaleScore(score: number, max: number, targetMax: number): number {
  return clamp((score / max) * targetMax);
}

export function resolveOpportunityDNA(opp: Opportunity): OpportunityDNA {
  const base = CATEGORY_BASE[opp.category];
  const override = DNA_OVERRIDES[opp.id] ?? opp.dna ?? {};

  const effortFromScore = scaleScore(opp.effortScore, 100, 10);
  const competitivenessFromFit = scaleScore(
    100 - opp.fitScore + opp.sourceTrustScore * 0.3,
    100,
    10,
  );

  let money = base.money;
  if (opp.paid && opp.compensation) money = Math.max(money, 7);
  if (!opp.paid && opp.category !== "scholarships") money = Math.min(money, 3);
  if (opp.category === "scholarships") money = 9;

  let prestige = base.prestige;
  if (opp.tags.includes("big-tech")) prestige = Math.max(prestige, 9);
  if (opp.tags.includes("beginner-friendly")) prestige = Math.min(prestige, 5);

  let network = base.network;
  if (opp.tags.includes("community") || opp.organization.toLowerCase().includes("colorstack")) {
    network = Math.max(network, 9);
  }

  const merged: OpportunityDNA = {
    money: clamp(override.money ?? money),
    resume: clamp(override.resume ?? base.resume),
    network: clamp(override.network ?? network),
    prestige: clamp(override.prestige ?? prestige),
    experience: clamp(override.experience ?? base.experience),
    effort: clamp(override.effort ?? effortFromScore),
    competitiveness: clamp(override.competitiveness ?? competitivenessFromFit),
    inPerson: override.inPerson ?? !opp.remote,
    remote: override.remote ?? opp.remote,
    localToSchool:
      override.localToSchool ??
      (opp.tags.includes("tamu") ||
        opp.tags.includes("campus") ||
        opp.category === "campus"),
    tags: override.tags ?? opp.tags,
  };

  return merged;
}

export function getTopDimensions(
  dna: OpportunityDNA,
  count = 3,
  minScore = 5,
): { key: keyof OpportunityDNA; label: string; value: number }[] {
  return DNA_DIMENSIONS.map((d) => ({
    key: d.key,
    label: d.label,
    value: dna[d.key] as number,
  }))
    .filter((d) => d.value >= minScore)
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

const DIMENSION_NARRATIVES: Partial<Record<keyof OpportunityDNA, string>> = {
  money: "puts cash in your pocket soon",
  resume: "adds a strong line to your resume",
  network: "connects you to people who can open doors later",
  prestige: "carries a brand or signal employers recognize",
  experience: "builds real skills and portfolio proof",
  effort: "requires significant time investment",
  competitiveness: "is selective — high reward if you get in",
};

export function buildWhyThisMatters(
  opp: Opportunity,
  dna: OpportunityDNA,
): { highlights: { label: string; value: number }[]; narrative: string } {
  const highlights = getTopDimensions(dna, 3, 4).map((d) => ({
    label: d.label,
    value: d.value as number,
  }));

  const topKeys = getTopDimensions(dna, 2, 5).map((d) => d.key);
  const leverageParts = topKeys
    .map((k) => DIMENSION_NARRATIVES[k])
    .filter(Boolean);

  let narrative = opp.whyItMatters;
  if (leverageParts.length > 0) {
    const leverageSentence =
      highlights.length >= 2
        ? `This is valuable because it ${leverageParts.slice(0, 2).join(" and ")}.`
        : `This is valuable because it ${leverageParts[0]}.`;
    narrative = `${leverageSentence} ${opp.whyItMatters}`;
  }

  return { highlights, narrative };
}

export function attachDNA<T extends Opportunity>(opp: T): T & { dna: OpportunityDNA; whyThisMatters: ReturnType<typeof buildWhyThisMatters> } {
  const dna = resolveOpportunityDNA(opp);
  return {
    ...opp,
    dna,
    whyThisMatters: buildWhyThisMatters(opp, dna),
  };
}
