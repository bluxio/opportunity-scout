import type { OpportunityCategory, ScoredOpportunity } from "@/lib/opportunity-types";

export type TrajectoryGoal =
  | "break_into_ai"
  | "land_internship"
  | "earn_money"
  | "find_research"
  | "build_startup"
  | "build_resume"
  | "explore";

export interface TrajectoryProfile {
  goal: TrajectoryGoal;
  year?: string;
  major?: string;
  skills?: string;
  timeline?: string;
  school?: string;
}

export interface TrajectoryStep {
  order: number;
  action: string;
  opportunity: ScoredOpportunity;
}

export interface Trajectory {
  variant: "primary" | "alternative" | "contrarian";
  title: string;
  whyChosen: string;
  steps: TrajectoryStep[];
  expectedOutcome: string;
}

export interface TrajectoryBundle {
  primary: Trajectory;
  alternative: Trajectory;
  contrarian: Trajectory;
}

type DnaScoreKey = "money" | "resume" | "network" | "prestige" | "experience" | "effort" | "competitiveness";

interface ThemeConfig {
  title: string;
  stepCategories: OpportunityCategory[];
  preferTags: string[];
  dnaFocus: DnaScoreKey;
  whyChosen: (profile: TrajectoryProfile) => string;
  expectedOutcome: (profile: TrajectoryProfile) => string;
}

const THEMES: Record<TrajectoryGoal, ThemeConfig> = {
  break_into_ai: {
    title: "Break Into AI",
    stepCategories: ["programs", "fellowships", "hackathons", "internships", "startup_roles"],
    preferTags: ["ai", "machine-learning", "ml", "machine learning"],
    dnaFocus: "experience",
    whyChosen: (p) =>
      `Built for ${p.year ?? "students"} interested in AI — skill-building first, then portfolio proof, then AI-targeted roles.`,
    expectedOutcome: (p) =>
      `Competitive profile for AI internships within ${p.timeline ?? "6–12 months"}.`,
  },
  land_internship: {
    title: "Land a Strong Internship",
    stepCategories: ["fellowships", "programs", "internships", "campus", "startup_roles"],
    preferTags: ["swe", "big-tech", "structured-program", "interview-prep"],
    dnaFocus: "resume",
    whyChosen: (p) =>
      `Prioritizes resume signal and interview readiness for ${p.major ?? "your field"} before peak recruiting.`,
    expectedOutcome: (p) =>
      `Interview-ready pipeline for summer internships within ${p.timeline ?? "6–12 months"}.`,
  },
  earn_money: {
    title: "Earn Money Soon",
    stepCategories: ["campus", "paid_gigs", "local_jobs", "internships"],
    preferTags: ["part-time", "on-campus", "flexible-hours", "paid"],
    dnaFocus: "money",
    whyChosen: (p) =>
      `Focuses on paid, low-friction options${p.school ? ` near ${p.school}` : ""} while you keep building long-term options.`,
    expectedOutcome: () =>
      "Steady income within weeks while keeping internship options open.",
  },
  find_research: {
    title: "Find Research Experience",
    stepCategories: ["research", "fellowships", "programs", "scholarships", "internships"],
    preferTags: ["research", "reu", "lab"],
    dnaFocus: "experience",
    whyChosen: (p) =>
      `Research-first path for ${p.major ?? "STEM"} students building lab experience and grad-school optionality.`,
    expectedOutcome: (p) =>
      `Strong research profile and faculty connections within ${p.timeline ?? "6–12 months"}.`,
  },
  build_startup: {
    title: "Build Toward a Startup",
    stepCategories: ["fellowships", "hackathons", "startup_roles", "programs", "internships"],
    preferTags: ["startup", "entrepreneurship", "founder", "product"],
    dnaFocus: "network",
    whyChosen: (p) =>
      `Community and builder steps first — then startup roles — for students who want founder velocity.`,
    expectedOutcome: () =>
      "Network, shipped projects, and startup pipeline within 6–12 months.",
  },
  build_resume: {
    title: "Build Your Resume Fast",
    stepCategories: ["fellowships", "hackathons", "programs", "campus", "internships"],
    preferTags: ["build-experience", "beginner-friendly", "portfolio", "resume-boost"],
    dnaFocus: "resume",
    whyChosen: (p) =>
      `Low-barrier, high-signal steps to strengthen your resume as a ${p.year ?? "student"}.`,
    expectedOutcome: () =>
      "Meaningful resume lines and project proof within 3–6 months.",
  },
  explore: {
    title: "Explore What's Worth Your Time",
    stepCategories: ["programs", "fellowships", "hackathons", "campus", "internships"],
    preferTags: ["beginner-friendly", "community"],
    dnaFocus: "network",
    whyChosen: () =>
      "Breadth-first path when you're still deciding — sample different opportunity types before committing.",
    expectedOutcome: () =>
      "Clear sense of which opportunity types fit you within one semester.",
  },
};

const ALTERNATIVE: Record<TrajectoryGoal, TrajectoryGoal> = {
  break_into_ai: "land_internship",
  land_internship: "break_into_ai",
  earn_money: "land_internship",
  find_research: "land_internship",
  build_startup: "break_into_ai",
  build_resume: "land_internship",
  explore: "land_internship",
};

const CONTRARIAN: Record<TrajectoryGoal, TrajectoryGoal> = {
  break_into_ai: "earn_money",
  land_internship: "earn_money",
  earn_money: "build_startup",
  find_research: "earn_money",
  build_startup: "earn_money",
  build_resume: "explore",
  explore: "earn_money",
};

export function inferTrajectoryGoal(profile: {
  major?: string;
  skills?: string;
}): TrajectoryGoal {
  const skills = (profile.skills ?? "").toLowerCase();
  const major = (profile.major ?? "").toLowerCase();

  if (
    skills.includes("ai") ||
    skills.includes("ml") ||
    skills.includes("machine learning")
  ) {
    return "break_into_ai";
  }
  if (skills.includes("startup") || skills.includes("founder")) {
    return "build_startup";
  }
  if (skills.includes("research") || major.includes("bio")) {
    return "find_research";
  }
  if (skills.includes("money") || skills.includes("paid")) {
    return "earn_money";
  }
  if (major.includes("computer") || major.includes("cs") || major.includes("software")) {
    return "land_internship";
  }
  return "explore";
}

export function inferTimeline(year?: string): string {
  if (year === "Freshman" || year === "Sophomore") return "12 months";
  if (year === "Grad student") return "9 months";
  return "6 months";
}

export function toTrajectoryProfile(profile: {
  major?: string;
  year?: string;
  school?: string;
  skills?: string;
}): TrajectoryProfile {
  const goal = inferTrajectoryGoal(profile);
  return {
    goal,
    year: profile.year,
    major: profile.major,
    skills: profile.skills,
    school: profile.school,
    timeline: inferTimeline(profile.year),
  };
}

function scoreForTheme(
  opp: ScoredOpportunity,
  theme: ThemeConfig,
  profile: TrajectoryProfile,
): number {
  let score = opp.personalizedFit + opp.dna[theme.dnaFocus] * 4;

  for (const tag of theme.preferTags) {
    if (opp.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) {
      score += 12;
    }
  }

  const major = (profile.major ?? "").toLowerCase();
  if (major && opp.targetMajors.some((m) => major.includes(m.toLowerCase()))) {
    score += 8;
  }

  const school = (profile.school ?? "").toLowerCase();
  if (
    school &&
    (school.includes("tamu") || school.includes("texas a&m") || school.includes("aggie")) &&
    opp.tags.includes("tamu")
  ) {
    score += 14;
  }

  score -= opp.dna.effort * 0.15;
  return score;
}

function pickSteps(
  theme: ThemeConfig,
  opportunities: ScoredOpportunity[],
  usedIds: Set<string>,
  profile: TrajectoryProfile,
  maxSteps = 5,
): TrajectoryStep[] {
  const steps: TrajectoryStep[] = [];
  const pool = opportunities.filter((o) => !usedIds.has(o.id));

  for (const category of theme.stepCategories) {
    if (steps.length >= maxSteps) break;

    const candidates = pool
      .filter((o) => o.category === category)
      .sort((a, b) => scoreForTheme(b, theme, profile) - scoreForTheme(a, theme, profile));

    const pick = candidates[0];
    if (!pick) continue;

    usedIds.add(pick.id);
    steps.push({
      order: steps.length + 1,
      action: pick.nextAction,
      opportunity: pick,
    });
  }

  if (steps.length < 3) {
    const remaining = pool
      .filter((o) => !usedIds.has(o.id))
      .sort((a, b) => scoreForTheme(b, theme, profile) - scoreForTheme(a, theme, profile));

    for (const opp of remaining) {
      if (steps.length >= maxSteps) break;
      usedIds.add(opp.id);
      steps.push({
        order: steps.length + 1,
        action: opp.nextAction,
        opportunity: opp,
      });
    }
  }

  return steps;
}

function buildOneTrajectory(
  variant: Trajectory["variant"],
  goal: TrajectoryGoal,
  opportunities: ScoredOpportunity[],
  usedIds: Set<string>,
  profile: TrajectoryProfile,
): Trajectory {
  const theme = THEMES[goal];
  const steps = pickSteps(theme, opportunities, usedIds, profile);

  return {
    variant,
    title: theme.title,
    whyChosen: theme.whyChosen(profile),
    steps,
    expectedOutcome: theme.expectedOutcome(profile),
  };
}

/** Select primary, alternative, and contrarian trajectories from the opportunity database. */
export function generateTrajectory(
  profile: TrajectoryProfile,
  opportunities: ScoredOpportunity[],
): TrajectoryBundle {
  const open = opportunities.filter((o) => o.status !== "closed");
  const usedPrimary = new Set<string>();

  const primary = buildOneTrajectory(
    "primary",
    profile.goal,
    open,
    usedPrimary,
    profile,
  );

  const usedAlt = new Set(usedPrimary);
  const alternative = buildOneTrajectory(
    "alternative",
    ALTERNATIVE[profile.goal],
    open,
    usedAlt,
    profile,
  );

  const usedCon = new Set<string>();
  const contrarian = buildOneTrajectory(
    "contrarian",
    CONTRARIAN[profile.goal],
    open,
    usedCon,
    profile,
  );

  return { primary, alternative, contrarian };
}
