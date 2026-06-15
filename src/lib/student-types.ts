export const GOAL_BUCKETS = [
  {
    id: "land",
    label: "Land an opportunity",
    description: "Internship, research, fellowship, or resume-building role",
  },
  {
    id: "earn",
    label: "Earn money soon",
    description: "Paid gigs and flexible work you can start quickly",
  },
  {
    id: "explore",
    label: "I'm exploring",
    description: "Show me what's worth my time right now",
  },
] as const;

export type GoalBucket = (typeof GOAL_BUCKETS)[number]["id"];

export const YEAR_LEVELS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Grad student",
] as const;

export type YearLevel = (typeof YEAR_LEVELS)[number];

export const MAJOR_CHIPS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Biology",
  "Design",
  "Other",
] as const;

export type MajorChip = (typeof MAJOR_CHIPS)[number];

export const TIMELINE_OPTIONS = [
  "This week",
  "This month",
  "This summer",
] as const;

export type TimelineOption = (typeof TIMELINE_OPTIONS)[number];

/** @deprecated Used for mock opportunity tagging — derived from bucket at rank time */
export const STUDENT_GOALS = [
  "Get an internship",
  "Break into AI",
  "Build my resume",
  "Make money this summer",
  "Find research opportunities",
  "Find scholarships",
  "Build a startup",
  "I'm not sure",
] as const;

export type StudentGoal = (typeof STUDENT_GOALS)[number];

export const STUDENT_OPPORTUNITY_CATEGORIES = [
  "internship",
  "startup",
  "hackathon",
  "research",
  "scholarship",
  "fellowship",
  "gig",
] as const;

export type StudentOpportunityCategory =
  (typeof STUDENT_OPPORTUNITY_CATEGORIES)[number];

export interface StudentProfile {
  bucket: GoalBucket;
  year: YearLevel | "";
  major: string;
  majorCustom?: string;
  timeline: TimelineOption | "";
  school?: string;
  location?: string;
  skills?: string;
  resumeFileName?: string;
}

export interface ScoreComponents {
  fit: number;
  upside: number;
  urgency: number;
  accessibility: number;
  effort: number;
}

export interface StudentOpportunity {
  id: string;
  title: string;
  organization: string;
  category: StudentOpportunityCategory;
  deadline: string;
  estimatedEffort: string;
  estimatedUpside: string;
  whyItFits: string;
  nextAction: string;
  sourceLink: string;
  score: ScoreComponents;
  goalTags: StudentGoal[];
  majorTags: string[];
  skillTags: string[];
  bucketTags?: GoalBucket[];
}

export interface RankedOpportunity extends StudentOpportunity {
  opportunityScore: number;
  matchSummary: string;
}
