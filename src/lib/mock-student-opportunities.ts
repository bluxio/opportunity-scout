import curatedOpportunities from "@/data/opportunities.json";
import { computeOpportunityScore } from "@/lib/opportunity-score";
import {
  GOAL_BUCKETS,
  type GoalBucket,
  type RankedOpportunity,
  type StudentGoal,
  type StudentOpportunity,
  type StudentOpportunityCategory,
  type StudentProfile,
} from "@/lib/student-types";

const BUCKET_GOALS: Record<GoalBucket, StudentGoal[]> = {
  land: [
    "Get an internship",
    "Find research opportunities",
    "Build my resume",
    "Break into AI",
    "Build a startup",
    "Find scholarships",
  ],
  earn: ["Make money this summer", "Get an internship"],
  explore: ["I'm not sure", "Build my resume", "Get an internship"],
};

const BUCKET_CATEGORY_WEIGHT: Record<
  GoalBucket,
  Partial<Record<StudentOpportunityCategory, number>>
> = {
  land: {
    internship: 10,
    fellowship: 8,
    research: 8,
    startup: 6,
    hackathon: 5,
    scholarship: 4,
    gig: -8,
  },
  earn: {
    gig: 12,
    internship: 8,
    startup: -4,
    research: -10,
    scholarship: -8,
    fellowship: -10,
    hackathon: -6,
  },
  explore: {
    fellowship: 4,
    hackathon: 4,
    internship: 3,
  },
};

/** Manually curated real opportunities — edit `src/data/opportunities.json`. */
export const CURATED_OPPORTUNITIES: StudentOpportunity[] =
  curatedOpportunities as StudentOpportunity[];

/** @deprecated Use CURATED_OPPORTUNITIES */
export const MOCK_STUDENT_OPPORTUNITIES = CURATED_OPPORTUNITIES;

const BUILD_EXPERIENCE_IDS = new Set([
  "codepath-tip",
  "headstarter-accelerator",
  "headstarter-residency",
  "mlh",
  "devpost-hackathons",
  "nextgen-hacks",
  "colorstack",
]);

const STRETCH_INTERNSHIP_IDS = new Set([
  "google-careers",
  "openai-residency",
  "meta-university",
  "apple-college",
  "nvidia-intern",
]);

function isTamuSchool(school: string): boolean {
  const s = school.toLowerCase();
  return (
    s.includes("texas a&m") ||
    s.includes("texas a and m") ||
    s.includes("tamu") ||
    s.includes("aggie")
  );
}

const CAMPUS_TAMU_IDS = new Set(["tamu-career-center", "jobs-for-aggies"]);

const GENERIC_PORTAL_IDS = new Set(["startup-school", "yc-jobs", "handshake"]);

function effectiveMajor(profile: StudentProfile): string {
  if (profile.major === "Other" && profile.majorCustom?.trim()) {
    return profile.majorCustom.trim();
  }
  return profile.major;
}

function profileBoost(profile: StudentProfile, opp: StudentOpportunity): number {
  let boost = 0;
  const major = effectiveMajor(profile).toLowerCase();
  const skills = (profile.skills ?? "").toLowerCase();
  const bucketGoals = BUCKET_GOALS[profile.bucket];

  if (opp.goalTags.some((tag) => bucketGoals.includes(tag))) boost += 10;
  if (opp.bucketTags?.includes(profile.bucket)) boost += 6;

  const categoryWeight = BUCKET_CATEGORY_WEIGHT[profile.bucket][opp.category];
  if (categoryWeight) boost += categoryWeight;

  if (
    major &&
    opp.majorTags.some((tag) => major.includes(tag) || tag.includes(major))
  ) {
    boost += 8;
  } else if (major && opp.majorTags.length > 0) {
    boost -= 12;
  }

  if (
    GENERIC_PORTAL_IDS.has(opp.id) &&
    major &&
    opp.majorTags.length > 0 &&
    !opp.majorTags.some((tag) => major.includes(tag) || tag.includes(major))
  ) {
    boost -= 10;
  }

  if (major.includes("biology") && profile.bucket === "land") {
    if (opp.category === "research") boost += 14;
    if (opp.category === "scholarship") boost += 6;
    if (opp.category === "startup") boost -= 8;
    if (opp.id === "nsf-reu" || opp.id === "nsf-etap") boost += 12;
  }

  if (
    (major.includes("computer") || major === "computer science") &&
    profile.bucket === "land"
  ) {
    if (opp.goalTags.includes("Break into AI")) boost += 6;
    if (
      [
        "codepath-tip",
        "headstarter-accelerator",
        "neo-scholars",
        "nvidia-intern",
        "allen-ai",
        "rapid-agent-hackathon",
      ].includes(opp.id)
    ) {
      boost += 5;
    }
    if (GENERIC_PORTAL_IDS.has(opp.id)) boost -= 5;
  }

  if (skills && (skills.includes("ai") || skills.includes("machine learning"))) {
    if (opp.goalTags.includes("Break into AI")) boost += 5;
  }

  if (skills) {
    const skillHits = opp.skillTags.filter((tag) => skills.includes(tag)).length;
    boost += Math.min(skillHits * 3, 9);
  }

  if (profile.timeline === "This week") {
    if (opp.score.urgency >= 20) boost += 5;
  }
  if (profile.timeline === "This summer") {
    if (["internship", "research", "fellowship"].includes(opp.category)) {
      boost += 4;
    }
  }

  const school = profile.school ?? "";
  if (CAMPUS_TAMU_IDS.has(opp.id)) {
    if (school && isTamuSchool(school)) boost += 18;
    else boost -= 45;
  }

  if (profile.bucket === "earn") {
    if (GENERIC_PORTAL_IDS.has(opp.id) && opp.id === "startup-school") boost -= 14;
    if (opp.goalTags.includes("Make money this summer")) boost += 8;
    if (opp.category === "gig") boost += 6;
    if (opp.category === "internship") boost += 4;
    if (opp.category === "fellowship") boost -= 6;
  }

  const strength = profile.resumeAudit?.strength;
  if (strength === "weak") {
    if (["hackathon", "fellowship"].includes(opp.category)) boost += 8;
    if (BUILD_EXPERIENCE_IDS.has(opp.id)) boost += 6;
    if (STRETCH_INTERNSHIP_IDS.has(opp.id)) boost -= 6;
  } else if (strength === "developing") {
    if (["hackathon", "fellowship"].includes(opp.category)) boost += 4;
    if (BUILD_EXPERIENCE_IDS.has(opp.id)) boost += 3;
  }

  return boost;
}

function buildMatchSummary(profile: StudentProfile, opp: StudentOpportunity): string {
  const bucketLabel =
    GOAL_BUCKETS.find((b) => b.id === profile.bucket)?.label ?? profile.bucket;
  const major = effectiveMajor(profile);
  const parts = [`you chose "${bucketLabel}"`];

  if (profile.year) parts.push(`you're a ${profile.year}`);
  if (major) parts.push(`studying ${major}`);
  if (profile.timeline) parts.push(`${profile.timeline.toLowerCase()} timeline`);

  const categoryNote =
    BUCKET_CATEGORY_WEIGHT[profile.bucket][opp.category] &&
    (BUCKET_CATEGORY_WEIGHT[profile.bucket][opp.category] ?? 0) > 0
      ? ` Strong ${opp.category} pick for that focus.`
      : "";

  const resumeNote =
    profile.resumeAudit?.strength === "weak" &&
    ["hackathon", "fellowship"].includes(opp.category)
      ? " Prioritized as a strong build-experience step for where you are now."
      : "";

  return `Ranked high because ${parts.join(", ")}.${categoryNote}${resumeNote}`;
}

function personalizeWhyItFits(
  profile: StudentProfile,
  opp: StudentOpportunity,
): string {
  const major = effectiveMajor(profile);
  let detail = opp.whyItFits;
  if (major && detail.includes("your major")) {
    detail = detail.replace("your major", major);
  }
  return detail;
}

export function rankOpportunitiesForProfile(
  profile: StudentProfile,
  limit = 5,
): RankedOpportunity[] {
  return CURATED_OPPORTUNITIES.filter((opp) => opp.status !== "closed")
    .map((opp) => {
    const boost = profileBoost(profile, opp);
    const adjustedScore: typeof opp.score = {
      ...opp.score,
      fit: Math.min(25, opp.score.fit + Math.round(boost * 0.6)),
      accessibility: Math.min(25, opp.score.accessibility + Math.round(boost * 0.3)),
    };

    return {
      ...opp,
      whyItFits: personalizeWhyItFits(profile, opp),
      matchSummary: buildMatchSummary(profile, opp),
      score: adjustedScore,
      opportunityScore: computeOpportunityScore(adjustedScore),
    };
  })
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, limit);
}
