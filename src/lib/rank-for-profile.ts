import { resolveOpportunityDNA } from "@/lib/opportunity-dna";
import type { Opportunity, OpportunityDNA } from "@/lib/opportunity-types";

export type ProfileGoal =
  | "big_tech"
  | "research"
  | "startup"
  | "money"
  | "grad_school"
  | "exploring";

export interface LeverageProfile {
  school?: string;
  major?: string;
  year?: string;
  goal: ProfileGoal;
}

export interface LeverageRankedOpportunity extends Opportunity {
  dna: OpportunityDNA;
  leverageScore: number;
  leverageReason: string;
}

const DNA_LABEL: Record<string, string> = {
  network: "Network",
  resume: "Resume",
  money: "Money",
  prestige: "Prestige",
  experience: "Experience",
  effort: "Effort",
  competitiveness: "Competitiveness",
};

const GOAL_WEIGHTS: Record<ProfileGoal, Record<string, number>> = {
  big_tech: { resume: 3, network: 3, prestige: 2, experience: 2, money: 0 },
  research: { experience: 3, prestige: 3, network: 2, resume: 2, money: 0 },
  startup: { experience: 3, network: 2, resume: 2, prestige: 1, money: 1 },
  money: { money: 4, effort: -1, experience: 1, resume: 1, network: 0 },
  grad_school: { prestige: 3, experience: 3, network: 2, resume: 2, money: 0 },
  exploring: { resume: 2, network: 2, experience: 2, money: 1, prestige: 1 },
};

const GOAL_LABELS: Record<ProfileGoal, string> = {
  big_tech: "Big Tech Internship",
  research: "Research",
  startup: "Startup",
  money: "Make Money Fast",
  grad_school: "Graduate School",
  exploring: "Still figuring it out",
};

export function profileGoalLabel(goal: ProfileGoal): string {
  return GOAL_LABELS[goal];
}

function getTopDNADimension(dna: OpportunityDNA): string {
  const entries: { key: keyof OpportunityDNA; val: number }[] = [
    { key: "network", val: dna.network },
    { key: "resume", val: dna.resume },
    { key: "money", val: dna.money },
    { key: "prestige", val: dna.prestige },
    { key: "experience", val: dna.experience },
  ];
  entries.sort((a, b) => b.val - a.val);
  return DNA_LABEL[entries[0]?.key ?? "resume"] ?? "Resume";
}

function getLeverageReason(opp: Opportunity, goal: ProfileGoal, dna: OpportunityDNA): string {
  const top = getTopDNADimension(dna);
  const reasons: Record<ProfileGoal, string> = {
    big_tech: `Best ${top.toLowerCase()} signal for Big Tech recruiting`,
    research: `Strong ${top.toLowerCase()} for research track`,
    startup: `High ${top.toLowerCase()} in startup environment`,
    money: `Fastest path to income with ${top.toLowerCase()} upside`,
    grad_school: `${top} signal matters most for grad admissions`,
    exploring: `High ${top.toLowerCase()} with low commitment risk`,
  };
  return reasons[goal] ?? `Strong ${top.toLowerCase()} opportunity`;
}

function computeLeverageScore(
  opp: Opportunity,
  profile: LeverageProfile,
  weights: Record<string, number>,
  dna: OpportunityDNA,
): number {
  let score = 0;
  for (const [dim, weight] of Object.entries(weights)) {
    const val = dna[dim as keyof OpportunityDNA];
    if (typeof val === "number") score += val * weight;
  }

  if (opp.deadlineISO) {
    const daysLeft =
      (new Date(opp.deadlineISO).getTime() - Date.now()) / 86400000;
    if (daysLeft > 0 && daysLeft < 14) score *= 1.15;
  }

  const schoolToken = (profile.school ?? "").toLowerCase().split(" ")[0];
  if (
    schoolToken &&
    (opp.tags.some((t) => t.toLowerCase().includes(schoolToken)) ||
      (opp.tags.includes("tamu") &&
        (schoolToken.includes("tamu") || schoolToken.includes("texas"))))
  ) {
    score *= 1.1;
  }

  if (profile.major && opp.targetMajors.some((m) =>
    profile.major!.toLowerCase().includes(m.toLowerCase()),
  )) {
    score *= 1.08;
  }

  return score;
}

export function rankForProfile(
  opportunities: Opportunity[],
  profile: LeverageProfile,
  limit = 5,
): LeverageRankedOpportunity[] {
  const weights = GOAL_WEIGHTS[profile.goal] ?? GOAL_WEIGHTS.exploring;

  return opportunities
    .filter((o) => o.status !== "closed")
    .map((opp) => {
      const dna = resolveOpportunityDNA(opp);
      const leverageScore = computeLeverageScore(opp, profile, weights, dna);
      return {
        ...opp,
        dna,
        leverageScore,
        leverageReason: getLeverageReason(opp, profile.goal, dna),
      };
    })
    .sort((a, b) => b.leverageScore - a.leverageScore)
    .slice(0, limit);
}

/** Top DNA dimensions for compact display (abbreviated labels) */
export function getTopDnaPills(dna: OpportunityDNA, max = 3) {
  const map: { key: keyof OpportunityDNA; abbrev: string }[] = [
    { key: "network", abbrev: "Net" },
    { key: "resume", abbrev: "Res" },
    { key: "money", abbrev: "$" },
    { key: "experience", abbrev: "Exp" },
    { key: "prestige", abbrev: "Pre" },
  ];
  return map
    .map(({ key, abbrev }) => ({ abbrev, value: dna[key] as number }))
    .filter((p) => p.value >= 5)
    .sort((a, b) => b.value - a.value)
    .slice(0, max);
}

export function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function formatDeadlinePill(
  deadlineISO: string | undefined,
  status: Opportunity["status"],
  deadlineText: string,
): { label: string; variant: "urgent" | "soon" | "muted" | "rolling" } {
  if (status === "rolling" || deadlineText.toLowerCase().includes("rolling")) {
    return { label: "Rolling", variant: "rolling" };
  }
  if (!deadlineISO) {
    return { label: deadlineText.slice(0, 24), variant: "muted" };
  }
  const days = Math.ceil(
    (new Date(deadlineISO).getTime() - Date.now()) / 86400000,
  );
  if (days > 0 && days < 7) {
    return { label: `Due in ${days} day${days === 1 ? "" : "s"}`, variant: "urgent" };
  }
  const d = new Date(deadlineISO);
  const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days > 0 && days <= 30) {
    return { label: `Due ${monthDay}`, variant: "soon" };
  }
  const monthYear = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return { label: `Due ${monthYear}`, variant: "muted" };
}

export function modalSignalLine(opp: LeverageRankedOpportunity): string {
  const labelMap: Record<string, string> = {
    Net: "Network",
    Res: "Resume",
    $: "Paid",
    Exp: "Experience",
    Pre: "Prestige",
  };
  const pills = getTopDnaPills(opp.dna, 2)
    .map((p) => labelMap[p.abbrev] ?? p.abbrev)
    .join(" + ");
  const { label } = formatDeadlinePill(opp.deadlineISO, opp.status, opp.deadline);
  return [pills, label].filter(Boolean).join(" · ");
}
