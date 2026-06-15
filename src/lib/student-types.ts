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
  goal: StudentGoal;
  school: string;
  major: string;
  graduationYear: string;
  location: string;
  skills: string;
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
}

export interface RankedOpportunity extends StudentOpportunity {
  opportunityScore: number;
}
