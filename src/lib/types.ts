export const OPPORTUNITY_CATEGORIES = [
  "retail",
  "restaurant",
  "customer_service",
  "fitness",
  "internships",
  "technology",
] as const;

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export type CareerPagePlatform =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "workday"
  | "paycom"
  | "bamboohr"
  | "smartrecruiters"
  | "custom";

export type HiringStatus = "unknown" | "no_openings" | "hiring";

export interface SearchParams {
  location: string;
  radius: number;
  categories: OpportunityCategory[];
  intent?: string;
}

export interface Employer {
  id: string;
  name: string;
  website: string;
  category: OpportunityCategory;
  address: string;
  distanceMiles: number;
  platform?: CareerPagePlatform;
  careerPageUrl?: string;
  hiringStatus?: HiringStatus;
}

export interface CareerPage {
  url: string;
  platform: CareerPagePlatform;
}

export interface RawOpportunity {
  employerId: string;
  title: string;
  location: string;
  applyUrl: string;
  description?: string;
}

export interface ScoredOpportunity {
  id: string;
  company: string;
  title: string;
  location: string;
  applyLink: string;
  discoveredAt: string;
  fitScore: number;
  recommendation: string;
  surfacedReason: string;
  category: OpportunityCategory;
  employerWebsite: string;
  platform: CareerPagePlatform;
  distanceMiles: number;
}

export interface EmployerResearch {
  employerId: string;
  employerName: string;
  status: "checking" | "no_openings" | "hiring" | "error";
  message: string;
  platform?: CareerPagePlatform;
  roleCount?: number;
}

export interface ScoutReport {
  employersResearched: number;
  noOpenings: number;
  hiring: number;
  strongMatches: number;
  platformsChecked: CareerPagePlatform[];
}

export type WorkflowStepId =
  | "discover_employers"
  | "find_career_pages"
  | "detect_hiring_signals"
  | "find_opportunities"
  | "generate_summaries"
  | "rank_opportunities"
  | "store_results";

export type WorkflowStepStatus = "pending" | "running" | "complete" | "error";

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: WorkflowStepStatus;
  detail?: string;
}

export type SearchStatus = "running" | "complete" | "error";

export interface SearchSession {
  id: string;
  params: SearchParams;
  status: SearchStatus;
  steps: WorkflowStep[];
  opportunities: ScoredOpportunity[];
  employerResearch: EmployerResearch[];
  report: ScoutReport;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface WorkflowEvent {
  type:
    | "step_update"
    | "employer_research"
    | "opportunity"
    | "complete"
    | "error";
  step?: WorkflowStepId;
  stepStatus?: WorkflowStepStatus;
  message?: string;
  employerResearch?: EmployerResearch;
  opportunity?: ScoredOpportunity;
  session?: SearchSession;
}
