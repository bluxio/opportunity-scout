import type { ScoreComponents } from "@/lib/student-types";

/** OpportunityScore = Fit + Upside + Urgency + Accessibility - Effort */
export function computeOpportunityScore(components: ScoreComponents): number {
  const raw =
    components.fit +
    components.upside +
    components.urgency +
    components.accessibility -
    components.effort;

  return Math.round(Math.min(100, Math.max(0, raw)));
}
