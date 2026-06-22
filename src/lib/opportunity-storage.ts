import type { ProfileGoal } from "@/lib/rank-for-profile";
import type { OpportunitySubmission } from "@/lib/opportunity-types";

const SAVED_KEY = "opp-scout-saved";
const DISMISSED_KEY = "opp-scout-dismissed";
const SUBMISSIONS_KEY = "opp-scout-submissions";
const PROFILE_KEY = "opp-scout-feed-profile";

export interface FeedProfile {
  major: string;
  year: string;
  school: string;
  skills: string;
  goal?: ProfileGoal;
}

export function loadSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function loadDismissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): string[] {
  const current = loadSavedIds();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next;
}

export function dismissOpportunity(id: string): string[] {
  const dismissed = loadDismissedIds();
  if (!dismissed.includes(id)) dismissed.push(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  return dismissed;
}

export function loadSubmissions(): OpportunitySubmission[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) ?? "[]") as OpportunitySubmission[];
  } catch {
    return [];
  }
}

export function saveSubmission(
  data: Omit<OpportunitySubmission, "id" | "createdAt">,
): OpportunitySubmission[] {
  const entry: OpportunitySubmission = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = [...loadSubmissions(), entry];
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(all));
  return all;
}

export function loadFeedProfile(): FeedProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeedProfile;
  } catch {
    return null;
  }
}

export function saveFeedProfile(profile: FeedProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
