import type { StudentProfile } from "@/lib/student-types";

const STORAGE_KEY = "opp-scout-profile";

export function loadStudentProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearStudentProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}
