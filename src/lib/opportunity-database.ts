import rawDatabase from "@/data/opportunity-database.json";
import type {
  Opportunity,
  OpportunityCategory,
  ScoredOpportunity,
  SecondaryFilter,
  UserOpportunityProfile,
} from "@/lib/opportunity-types";

export const OPPORTUNITY_DATABASE: Opportunity[] =
  rawDatabase as Opportunity[];

const CLOSING_SOON_DAYS = 21;

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function profileBoost(opp: Opportunity, profile: UserOpportunityProfile): number {
  let boost = 0;
  const major = (profile.major ?? "").toLowerCase();
  const year = profile.year ?? "";
  const school = (profile.school ?? "").toLowerCase();
  const skills = (profile.skills ?? "").toLowerCase();

  if (major && opp.targetMajors.some((m) => major.includes(m.toLowerCase()))) {
    boost += 12;
  }
  if (year && opp.targetYears.includes(year)) boost += 8;
  if (
    school &&
    (opp.location.toLowerCase().includes(school) ||
      opp.title.toLowerCase().includes("tamu") ||
      opp.organization.toLowerCase().includes("texas a&m"))
  ) {
    if (school.includes("tamu") || school.includes("texas a&m") || school.includes("aggie")) {
      if (opp.tags.includes("tamu") || opp.organization.toLowerCase().includes("texas a&m")) {
        boost += 15;
      }
    }
  }
  if (skills) {
    const hits = opp.tags.filter((t) => skills.includes(t.toLowerCase())).length;
    boost += Math.min(hits * 4, 12);
  }
  if (profile.resumeStrength === "weak") {
    if (opp.tags.includes("build-experience") || opp.tags.includes("beginner-friendly")) {
      boost += 10;
    }
    if (opp.upsideScore >= 85 && opp.effortScore >= 70) boost -= 8;
  }
  if (skills.includes("ai") || skills.includes("machine learning") || opp.tags.includes("ai")) {
    if (opp.tags.includes("ai")) boost += 6;
  }

  return boost;
}

export function scoreOpportunity(
  opp: Opportunity,
  profile?: UserOpportunityProfile,
): ScoredOpportunity {
  const boost = profile ? profileBoost(opp, profile) : 0;
  const personalizedFit = Math.min(
    100,
    Math.max(0, Math.round(opp.fitScore + boost)),
  );

  const parts: string[] = [];
  if (profile?.major && opp.targetMajors.length > 0) {
    if (opp.targetMajors.some((m) => profile.major!.toLowerCase().includes(m.toLowerCase()))) {
      parts.push(`matches ${profile.major}`);
    }
  }
  if (profile?.year && opp.targetYears.includes(profile.year)) {
    parts.push(`${profile.year} year`);
  }
  if (opp.tags.includes("ai") && profile?.skills?.toLowerCase().includes("ai")) {
    parts.push("AI interest");
  }

  return {
    ...opp,
    personalizedFit,
    matchReason: parts.length > 0 ? parts.join(" · ") : undefined,
  };
}

export function searchAndFilterOpportunities(options: {
  query?: string;
  category?: OpportunityCategory | "all";
  secondary?: SecondaryFilter | "all";
  profile?: UserOpportunityProfile;
  excludeIds?: string[];
  limit?: number;
}): ScoredOpportunity[] {
  const {
    query = "",
    category = "all",
    secondary = "all",
    profile,
    excludeIds = [],
    limit,
  } = options;

  const q = query.trim().toLowerCase();

  const filtered = OPPORTUNITY_DATABASE.filter((opp) => {
    if (excludeIds.includes(opp.id)) return false;
    if (opp.status === "closed") return false;
    if (category !== "all" && opp.category !== category) return false;

    if (q) {
      const haystack = [
        opp.title,
        opp.organization,
        opp.tags.join(" "),
        opp.location,
        opp.sourceName,
        opp.goodFor,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    switch (secondary) {
      case "deadline_soon": {
        const days = daysUntil(opp.deadlineISO);
        if (opp.status !== "closing_soon" && (days === null || days > CLOSING_SOON_DAYS || days < 0)) {
          return false;
        }
        break;
      }
      case "high_upside":
        if (opp.upsideScore < 75) return false;
        break;
      case "low_effort":
        if (opp.effortScore > 40) return false;
        break;
      case "paid":
        if (!opp.paid) return false;
        break;
      case "remote":
        if (!opp.remote) return false;
        break;
      case "local":
        if (opp.remote) return false;
        break;
      case "weak_resume":
        if (!opp.tags.includes("build-experience") && !opp.tags.includes("beginner-friendly")) {
          return false;
        }
        break;
      case "ai":
        if (!opp.tags.includes("ai")) return false;
        break;
      case "recommended":
        break;
      default:
        break;
    }

    return true;
  });

  let results = filtered.map((opp) => scoreOpportunity(opp, profile));

  results.sort((a, b) => {
    if (secondary === "deadline_soon") {
      const da = daysUntil(a.deadlineISO) ?? 999;
      const db = daysUntil(b.deadlineISO) ?? 999;
      return da - db;
    }
    if (secondary === "high_upside") return b.upsideScore - a.upsideScore;
    if (secondary === "low_effort") return a.effortScore - b.effortScore;
    return b.personalizedFit - a.personalizedFit;
  });

  if (limit) results = results.slice(0, limit);
  return results;
}

export function getRecommendedOpportunities(
  profile?: UserOpportunityProfile,
  limit = 5,
  excludeIds: string[] = [],
): ScoredOpportunity[] {
  return searchAndFilterOpportunities({
    profile,
    secondary: "recommended",
    excludeIds,
    limit,
  });
}

export function getOpportunityById(id: string): Opportunity | undefined {
  return OPPORTUNITY_DATABASE.find((o) => o.id === id);
}

export function formatCategoryLabel(category: OpportunityCategory): string {
  const labels: Record<OpportunityCategory, string> = {
    internships: "Internship",
    startup_roles: "Startup Role",
    local_jobs: "Local Job",
    paid_gigs: "Paid Gig",
    hackathons: "Hackathon",
    fellowships: "Fellowship",
    scholarships: "Scholarship",
    research: "Research",
    campus: "Campus",
    programs: "Program",
  };
  return labels[category] ?? category;
}
