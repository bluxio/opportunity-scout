export const OPPORTUNITY_CATEGORIES = [
  { id: "internships", label: "Internships" },
  { id: "startup_roles", label: "Startup Roles" },
  { id: "local_jobs", label: "Local Jobs" },
  { id: "paid_gigs", label: "Paid Gigs" },
  { id: "hackathons", label: "Hackathons" },
  { id: "fellowships", label: "Fellowships" },
  { id: "scholarships", label: "Scholarships" },
  { id: "research", label: "Research" },
  { id: "campus", label: "Campus" },
  { id: "programs", label: "Programs" },
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number]["id"];

export type OpportunityStatus = "open" | "closing_soon" | "rolling" | "closed";

/** Optional hand-curated DNA overrides (0–10 per dimension) */
export interface OpportunityDNAInput {
  money?: number;
  resume?: number;
  network?: number;
  prestige?: number;
  experience?: number;
  effort?: number;
  competitiveness?: number;
  inPerson?: boolean;
  remote?: boolean;
  localToSchool?: boolean;
  tags?: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  sourceName: string;
  sourceUrl: string;
  applyUrl: string;
  deadline: string;
  deadlineISO?: string;
  location: string;
  remote: boolean;
  paid: boolean;
  compensation?: string;
  eligibility: string;
  tags: string[];
  targetMajors: string[];
  targetYears: string[];
  effortScore: number;
  upsideScore: number;
  urgencyScore: number;
  fitScore: number;
  sourceTrustScore: number;
  status: OpportunityStatus;
  dateAdded: string;
  whyItMatters: string;
  goodFor: string;
  nextAction: string;
  /** Optional curated DNA overrides — inferred from category when omitted */
  dna?: OpportunityDNAInput;
  /** Dev-only: not a verified live listing */
  isPlaceholder?: boolean;
}

export interface OpportunityDNA {
  money: number;
  resume: number;
  network: number;
  prestige: number;
  experience: number;
  effort: number;
  competitiveness: number;
  inPerson: boolean;
  remote: boolean;
  localToSchool?: boolean;
  tags: string[];
}

export interface WhyThisMattersBlock {
  highlights: { label: string; value: number }[];
  narrative: string;
}

export interface ScoredOpportunity extends Opportunity {
  personalizedFit: number;
  matchReason?: string;
  dna: OpportunityDNA;
  whyThisMatters: WhyThisMattersBlock;
}

export type SecondaryFilter =
  | "recommended"
  | "deadline_soon"
  | "high_upside"
  | "low_effort"
  | "paid"
  | "remote"
  | "local"
  | "weak_resume"
  | "ai";

export interface UserOpportunityProfile {
  major?: string;
  year?: string;
  school?: string;
  skills?: string;
  resumeStrength?: "weak" | "developing" | "strong";
}

export interface OpportunitySubmission {
  id: string;
  title: string;
  organization: string;
  link: string;
  category: string;
  deadline: string;
  notes: string;
  createdAt: string;
}
