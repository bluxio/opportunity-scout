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
    internship: 4,
    research: -10,
    scholarship: -8,
    fellowship: -6,
  },
  explore: {
    fellowship: 4,
    hackathon: 4,
    internship: 3,
  },
};

export const MOCK_STUDENT_OPPORTUNITIES: StudentOpportunity[] = [
  {
    id: "neo-scholars",
    title: "Neo Scholars Program",
    organization: "Neo",
    category: "fellowship",
    deadline: "Friday, Jun 13",
    estimatedEffort: "2 hour application",
    estimatedUpside: "Elite network and founder access",
    whyItFits: "Strong match for CS students interested in startups.",
    nextAction: "Complete application before Friday.",
    sourceLink: "https://neo.com/scholars",
    score: { fit: 22, upside: 24, urgency: 18, accessibility: 16, effort: 8 },
    goalTags: ["Build a startup", "Build my resume", "Break into AI"],
    majorTags: ["computer science", "engineering", "business"],
    skillTags: ["python", "leadership", "entrepreneurship"],
  },
  {
    id: "google-swe-intern",
    title: "Software Engineering Intern",
    organization: "Google",
    category: "internship",
    deadline: "Oct 15",
    estimatedEffort: "45 min application + OA",
    estimatedUpside: "Top-tier resume signal and mentorship",
    whyItFits: "Aligns with your major and technical skills.",
    nextAction: "Apply on Google Careers and schedule OA prep.",
    sourceLink: "https://careers.google.com",
    score: { fit: 20, upside: 25, urgency: 12, accessibility: 10, effort: 14 },
    goalTags: ["Get an internship", "Build my resume", "Break into AI"],
    majorTags: ["computer science", "software engineering", "data science"],
    skillTags: ["algorithms", "python", "java"],
  },
  {
    id: "colorstack-fellow",
    title: "ColorStack Fellowship",
    organization: "ColorStack",
    category: "fellowship",
    deadline: "Rolling",
    estimatedEffort: "30 min application",
    estimatedUpside: "Community, referrals, and interview prep",
    whyItFits: "Built for underrepresented students breaking into tech.",
    nextAction: "Join ColorStack and submit fellowship form.",
    sourceLink: "https://colorstack.org",
    score: { fit: 21, upside: 20, urgency: 14, accessibility: 22, effort: 6 },
    goalTags: ["Get an internship", "Build my resume", "I'm not sure"],
    majorTags: ["computer science", "engineering", "information systems"],
    skillTags: ["networking", "resume"],
  },
  {
    id: "gemini-hackathon",
    title: "Gemini API Hackathon",
    organization: "Google Cloud",
    category: "hackathon",
    deadline: "Jun 20",
    estimatedEffort: "1 weekend build",
    estimatedUpside: "Portfolio project + prizes",
    whyItFits: "Fast way to show AI project experience.",
    nextAction: "Register team and draft project idea tonight.",
    sourceLink: "https://cloud.google.com/events",
    score: { fit: 19, upside: 18, urgency: 20, accessibility: 20, effort: 10 },
    goalTags: ["Break into AI", "Build my resume", "Build a startup"],
    majorTags: ["computer science", "data science", "design"],
    skillTags: ["ai", "python", "react"],
  },
  {
    id: "nsf-reu",
    title: "NSF REU — Machine Learning",
    organization: "University Research Consortium",
    category: "research",
    deadline: "Feb 1",
    estimatedEffort: "1 hour application + statement",
    estimatedUpside: "Paid summer research and grad school prep",
    whyItFits: "Matches research goals and technical background.",
    nextAction: "Email professor for recommendation letter.",
    sourceLink: "https://www.nsf.gov/reu",
    score: { fit: 23, upside: 22, urgency: 8, accessibility: 12, effort: 12 },
    goalTags: ["Find research opportunities", "Build my resume"],
    majorTags: ["computer science", "mathematics", "physics", "biology"],
    skillTags: ["research", "python", "statistics"],
  },
  {
    id: "coca-scholars",
    title: "Coca-Cola Scholars Program",
    organization: "Coca-Cola Scholars Foundation",
    category: "scholarship",
    deadline: "Oct 31",
    estimatedEffort: "3 hour application",
    estimatedUpside: "$20,000 scholarship",
    whyItFits: "Rewards leadership beyond GPA.",
    nextAction: "Draft leadership essay this week.",
    sourceLink: "https://www.coca-colascholarsfoundation.org",
    score: { fit: 18, upside: 24, urgency: 10, accessibility: 14, effort: 11 },
    goalTags: ["Find scholarships", "Build my resume"],
    majorTags: [],
    skillTags: ["leadership", "community"],
  },
  {
    id: "yc-startup-school",
    title: "Startup School",
    organization: "Y Combinator",
    category: "startup",
    deadline: "Rolling",
    estimatedEffort: "1 hour signup + weekly sessions",
    estimatedUpside: "Founder network and startup playbook",
    whyItFits: "Low-barrier entry to startup ecosystem.",
    nextAction: "Create account and join current cohort.",
    sourceLink: "https://www.startupschool.org",
    score: { fit: 20, upside: 23, urgency: 16, accessibility: 24, effort: 5 },
    goalTags: ["Build a startup", "Build my resume"],
    majorTags: ["business", "computer science", "economics"],
    skillTags: ["entrepreneurship", "product"],
  },
  {
    id: "handshake-intern",
    title: "Local Tech Internship Fair",
    organization: "Handshake",
    category: "internship",
    deadline: "Next Thursday",
    estimatedEffort: "2 hours at fair + follow-ups",
    estimatedUpside: "Multiple interviews in one day",
    whyItFits: "Concentrated access near your campus.",
    nextAction: "RSVP and print 10 copies of resume.",
    sourceLink: "https://joinhandshake.com",
    score: { fit: 17, upside: 16, urgency: 22, accessibility: 21, effort: 7 },
    goalTags: ["Get an internship", "I'm not sure"],
    majorTags: [],
    skillTags: ["networking"],
  },
  {
    id: "mlh-hackathon",
    title: "MLH Hackathon Weekend",
    organization: "Major League Hacking",
    category: "hackathon",
    deadline: "This Saturday",
    estimatedEffort: "48 hour sprint",
    estimatedUpside: "Team project for portfolio",
    whyItFits: "Great if you learn best by building.",
    nextAction: "Find a team in Discord #team-formation.",
    sourceLink: "https://mlh.io",
    score: { fit: 18, upside: 17, urgency: 23, accessibility: 19, effort: 12 },
    goalTags: ["Build my resume", "Break into AI", "Build a startup"],
    majorTags: ["computer science", "design"],
    skillTags: ["hackathon", "react", "teamwork"],
  },
  {
    id: "stripe-scholarship",
    title: "Stripe Diversity Scholarship",
    organization: "Stripe",
    category: "scholarship",
    deadline: "Nov 1",
    estimatedEffort: "1 hour application",
    estimatedUpside: "$10,000 + Stripe mentorship",
    whyItFits: "Combines funding with fintech exposure.",
    nextAction: "Submit application and link GitHub.",
    sourceLink: "https://stripe.com/jobs",
    score: { fit: 19, upside: 21, urgency: 9, accessibility: 15, effort: 8 },
    goalTags: ["Find scholarships", "Get an internship"],
    majorTags: ["computer science", "finance"],
    skillTags: ["javascript", "apis"],
  },
  {
    id: "campus-research-assistant",
    title: "Undergraduate Research Assistant",
    organization: "Campus AI Lab",
    category: "research",
    deadline: "Rolling",
    estimatedEffort: "Email + 15 min meeting",
    estimatedUpside: "Publication path and professor mentorship",
    whyItFits: "On-campus and flexible for students.",
    nextAction: "Email PI with resume and interest paragraph.",
    sourceLink: "https://example.edu/research",
    score: { fit: 22, upside: 20, urgency: 15, accessibility: 23, effort: 6 },
    goalTags: ["Find research opportunities", "Break into AI"],
    majorTags: ["computer science", "data science", "engineering"],
    skillTags: ["python", "machine learning"],
  },
  {
    id: "freelance-web-gig",
    title: "Part-time Web Developer",
    organization: "Local Nonprofit",
    category: "gig",
    deadline: "Open until filled",
    estimatedEffort: "5–10 hrs/week",
    estimatedUpside: "Paid experience + impact project",
    whyItFits: "Earn while building portfolio pieces.",
    nextAction: "Send portfolio link and availability.",
    sourceLink: "https://example.org/jobs",
    score: { fit: 16, upside: 14, urgency: 17, accessibility: 22, effort: 9 },
    goalTags: ["Make money this summer", "Build my resume"],
    majorTags: ["computer science", "design"],
    skillTags: ["react", "css", "javascript"],
  },
  {
    id: "breakthrough-ai-fellowship",
    title: "Breakthrough AI Fellowship",
    organization: "AI2",
    category: "fellowship",
    deadline: "Jan 15",
    estimatedEffort: "2 hour application",
    estimatedUpside: "Research exposure at top AI lab",
    whyItFits: "Ideal for students targeting AI careers.",
    nextAction: "Prepare project write-up and references.",
    sourceLink: "https://allenai.org",
    score: { fit: 24, upside: 24, urgency: 7, accessibility: 11, effort: 13 },
    goalTags: ["Break into AI", "Find research opportunities"],
    majorTags: ["computer science", "data science"],
    skillTags: ["nlp", "pytorch", "research"],
  },
  {
    id: "devpost-hackathon",
    title: "Student Innovation Hackathon",
    organization: "Devpost",
    category: "hackathon",
    deadline: "Jun 18",
    estimatedEffort: "1 week part-time",
    estimatedUpside: "Prizes and recruiter visibility",
    whyItFits: "Low commitment compared to 48h sprints.",
    nextAction: "Register and bookmark submission checklist.",
    sourceLink: "https://devpost.com",
    score: { fit: 17, upside: 16, urgency: 19, accessibility: 20, effort: 8 },
    goalTags: ["Build my resume", "Build a startup", "I'm not sure"],
    majorTags: [],
    skillTags: ["product", "design"],
  },
  {
    id: "microsoft-explore",
    title: "Explore Microsoft Program",
    organization: "Microsoft",
    category: "internship",
    deadline: "Sep 30",
    estimatedEffort: "1 hour application",
    estimatedUpside: "Freshman/sophomore friendly internship pipeline",
    whyItFits: "Designed for early-stage CS students.",
    nextAction: "Apply before class registration crunch.",
    sourceLink: "https://careers.microsoft.com",
    score: { fit: 21, upside: 22, urgency: 11, accessibility: 17, effort: 10 },
    goalTags: ["Get an internship", "Build my resume"],
    majorTags: ["computer science", "information systems"],
    skillTags: ["programming"],
  },
  {
    id: "gates-scholarship",
    title: "Gates Scholarship",
    organization: "Gates Foundation",
    category: "scholarship",
    deadline: "Sep 15",
    estimatedEffort: "4 hour application",
    estimatedUpside: "Full cost of attendance coverage",
    whyItFits: "High upside if you meet eligibility.",
    nextAction: "Review eligibility checklist today.",
    sourceLink: "https://www.thegatesscholarship.org",
    score: { fit: 15, upside: 25, urgency: 8, accessibility: 8, effort: 15 },
    goalTags: ["Find scholarships"],
    majorTags: [],
    skillTags: ["leadership", "community"],
  },
  {
    id: "startup-intern",
    title: "Founding Engineer Intern",
    organization: "Seed-stage Startup",
    category: "startup",
    deadline: "Rolling",
    estimatedEffort: "30 min intro call",
    estimatedUpside: "Ownership and fast learning curve",
    whyItFits: "Best if you want startup velocity over brand.",
    nextAction: "DM founder on LinkedIn with 3-bullet pitch.",
    sourceLink: "https://www.ycombinator.com/jobs",
    score: { fit: 20, upside: 21, urgency: 16, accessibility: 18, effort: 7 },
    goalTags: ["Build a startup", "Get an internship", "Make money this summer"],
    majorTags: ["computer science", "engineering"],
    skillTags: ["full-stack", "react", "node"],
  },
  {
    id: "tutoring-gig",
    title: "CS Peer Tutor",
    organization: "Campus Learning Center",
    category: "gig",
    deadline: "Rolling",
    estimatedEffort: "1 hour onboarding",
    estimatedUpside: "Steady pay + reinforces fundamentals",
    whyItFits: "Flexible hours around your class schedule.",
    nextAction: "Apply on campus job portal.",
    sourceLink: "https://example.edu/jobs",
    score: { fit: 15, upside: 12, urgency: 18, accessibility: 24, effort: 4 },
    goalTags: ["Make money this summer", "I'm not sure"],
    majorTags: ["computer science", "mathematics"],
    skillTags: ["teaching", "communication"],
  },
  {
    id: "openai-residency",
    title: "Residency — Applied AI",
    organization: "OpenAI",
    category: "fellowship",
    deadline: "Mar 1",
    estimatedEffort: "3 hour application",
    estimatedUpside: "Elite AI career acceleration",
    whyItFits: "Stretch goal with outsized upside.",
    nextAction: "Start project appendix this weekend.",
    sourceLink: "https://openai.com/careers",
    score: { fit: 18, upside: 25, urgency: 6, accessibility: 6, effort: 16 },
    goalTags: ["Break into AI", "Find research opportunities"],
    majorTags: ["computer science", "data science"],
    skillTags: ["machine learning", "python"],
  },
  {
    id: "swe-at-startup-week",
    title: "Startup Week Builder Track",
    organization: "Techstars",
    category: "startup",
    deadline: "Next Monday",
    estimatedEffort: "Evenings for 5 days",
    estimatedUpside: "MVP + mentor feedback",
    whyItFits: "Structured path from idea to demo.",
    nextAction: "Register and pick problem space.",
    sourceLink: "https://www.techstars.com",
    score: { fit: 19, upside: 19, urgency: 21, accessibility: 19, effort: 9 },
    goalTags: ["Build a startup", "Build my resume"],
    majorTags: ["business", "computer science"],
    skillTags: ["product", "pitching"],
  },
  {
    id: "summer-research-nsf",
    title: "Summer Undergraduate Research",
    organization: "State University Lab",
    category: "research",
    deadline: "Apr 1",
    estimatedEffort: "Statement + transcript",
    estimatedUpside: "Paid research credit",
    whyItFits: "Local option near your location.",
    nextAction: "Meet with department advisor.",
    sourceLink: "https://example.edu/summer-research",
    score: { fit: 20, upside: 18, urgency: 10, accessibility: 20, effort: 10 },
    goalTags: ["Find research opportunities", "Make money this summer"],
    majorTags: ["biology", "chemistry", "engineering", "computer science"],
    skillTags: ["lab", "research"],
  },
  {
    id: "adobe-intern",
    title: "Product Design Intern",
    organization: "Adobe",
    category: "internship",
    deadline: "Nov 30",
    estimatedEffort: "Portfolio + application",
    estimatedUpside: "Design craft at scale",
    whyItFits: "Strong for design-interested majors.",
    nextAction: "Update portfolio with 2 case studies.",
    sourceLink: "https://careers.adobe.com",
    score: { fit: 19, upside: 21, urgency: 9, accessibility: 13, effort: 12 },
    goalTags: ["Get an internship", "Build my resume"],
    majorTags: ["design", "human-computer interaction", "computer science"],
    skillTags: ["figma", "ui", "ux"],
  },
  {
    id: "codepath-course",
    title: "CodePath Technical Interview Prep",
    organization: "CodePath",
    category: "fellowship",
    deadline: "Rolling",
    estimatedEffort: "10 weeks, 5 hrs/week",
    estimatedUpside: "Interview readiness for top internships",
    whyItFits: "Built for students targeting big tech.",
    nextAction: "Apply for upcoming cohort.",
    sourceLink: "https://www.codepath.org",
    score: { fit: 22, upside: 20, urgency: 14, accessibility: 21, effort: 11 },
    goalTags: ["Get an internship", "Build my resume", "I'm not sure"],
    majorTags: ["computer science", "software engineering"],
    skillTags: ["algorithms", "data structures"],
  },
  {
    id: "local-hack-night",
    title: "AI Build Night",
    organization: "Campus Tech Club",
    category: "hackathon",
    deadline: "Wednesday",
    estimatedEffort: "3 hours one evening",
    estimatedUpside: "Quick win project + peers",
    whyItFits: "Low effort way to stay active this week.",
    nextAction: "RSVP and bring laptop.",
    sourceLink: "https://example.edu/events",
    score: { fit: 16, upside: 13, urgency: 24, accessibility: 23, effort: 3 },
    goalTags: ["Break into AI", "I'm not sure", "Build my resume"],
    majorTags: [],
    skillTags: ["ai", "teamwork"],
  },
  {
    id: "merit-scholarship",
    title: "Merit Scholarship — STEM",
    organization: "Regional Foundation",
    category: "scholarship",
    deadline: "Dec 1",
    estimatedEffort: "1 hour application",
    estimatedUpside: "$5,000 toward tuition",
    whyItFits: "Accessible scholarship with simple form.",
    nextAction: "Submit before finals week.",
    sourceLink: "https://example.org/scholarships",
    score: { fit: 17, upside: 18, urgency: 7, accessibility: 22, effort: 5 },
    goalTags: ["Find scholarships"],
    majorTags: ["engineering", "computer science", "mathematics"],
    skillTags: [],
  },
  {
    id: "campus-ambassador",
    title: "Campus Ambassador",
    organization: "Fintech Startup",
    category: "gig",
    deadline: "Rolling",
    estimatedEffort: "3 hrs/week",
    estimatedUpside: "Commission + startup exposure",
    whyItFits: "Flexible paid role with low barrier.",
    nextAction: "Fill 5-minute interest form.",
    sourceLink: "https://example.com/ambassadors",
    score: { fit: 14, upside: 15, urgency: 16, accessibility: 23, effort: 5 },
    goalTags: ["Make money this summer", "Build a startup"],
    majorTags: ["business", "marketing"],
    skillTags: ["social media", "communication"],
  },
  {
    id: "intel-intern",
    title: "Hardware Engineering Intern",
    organization: "Intel",
    category: "internship",
    deadline: "Oct 1",
    estimatedEffort: "Online application",
    estimatedUpside: "Semiconductor industry experience",
    whyItFits: "Matches engineering-focused majors.",
    nextAction: "Apply and highlight lab coursework.",
    sourceLink: "https://jobs.intel.com",
    score: { fit: 18, upside: 20, urgency: 10, accessibility: 14, effort: 11 },
    goalTags: ["Get an internship"],
    majorTags: ["electrical engineering", "computer engineering", "physics"],
    skillTags: ["embedded", "c++"],
  },
  {
    id: "notion-startup-grant",
    title: "Student Founder Grant",
    organization: "Notion for Startups",
    category: "startup",
    deadline: "Rolling",
    estimatedEffort: "20 min application",
    estimatedUpside: "Free tools + visibility",
    whyItFits: "Easy win while building your startup.",
    nextAction: "Apply with one-paragraph pitch.",
    sourceLink: "https://www.notion.so/startups",
    score: { fit: 17, upside: 14, urgency: 15, accessibility: 24, effort: 3 },
    goalTags: ["Build a startup"],
    majorTags: [],
    skillTags: ["entrepreneurship"],
  },
];

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

  if (profile.resumeFileName) boost += 1;

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

  return `Ranked high because ${parts.join(", ")}.${categoryNote}`;
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
  return MOCK_STUDENT_OPPORTUNITIES.map((opp) => {
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
