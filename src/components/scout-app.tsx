"use client";

import { MoveCard } from "@/components/move-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rankOpportunitiesForProfile } from "@/lib/mock-student-opportunities";
import {
  loadStudentProfile,
  saveStudentProfile,
} from "@/lib/student-profile-storage";
import {
  STUDENT_GOALS,
  type RankedOpportunity,
  type StudentGoal,
  type StudentProfile,
} from "@/lib/student-types";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type AppPhase = "goal" | "onboarding" | "running" | "complete";

const LOADING_LINES = [
  "Matching opportunities to your goal…",
  "Scoring fit, upside, and urgency…",
  "Picking your top moves for this week…",
];

const EMPTY_PROFILE: Omit<StudentProfile, "goal"> = {
  school: "",
  major: "",
  graduationYear: "",
  location: "",
  skills: "",
};

export function ScoutApp() {
  const [phase, setPhase] = useState<AppPhase>("goal");
  const [selectedGoal, setSelectedGoal] = useState<StudentGoal | null>(null);
  const [profile, setProfile] = useState<Omit<StudentProfile, "goal">>(EMPTY_PROFILE);
  const [moves, setMoves] = useState<RankedOpportunity[]>([]);
  const [statusLine, setStatusLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadStudentProfile();
    if (saved) {
      setProfile({
        school: saved.school,
        major: saved.major,
        graduationYear: saved.graduationYear,
        location: saved.location,
        skills: saved.skills,
      });
    }
  }, []);

  const selectGoal = (goal: StudentGoal) => {
    setSelectedGoal(goal);
    setError(null);
    setPhase("onboarding");
  };

  const updateProfile = (field: keyof Omit<StudentProfile, "goal">, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const runRanking = async () => {
    if (!selectedGoal) return;

    const required: (keyof Omit<StudentProfile, "goal">)[] = [
      "school",
      "major",
      "graduationYear",
      "location",
      "skills",
    ];

    const missing = required.filter((field) => !profile[field].trim());
    if (missing.length > 0) {
      setError("Please fill out all fields to continue.");
      return;
    }

    const fullProfile: StudentProfile = { goal: selectedGoal, ...profile };
    saveStudentProfile(fullProfile);

    setPhase("running");
    setError(null);
    setMoves([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    for (let i = 0; i < LOADING_LINES.length; i++) {
      setStatusLine(LOADING_LINES[i]);
      await new Promise((resolve) => setTimeout(resolve, 900));
    }

    setMoves(rankOpportunitiesForProfile(fullProfile, 5));
    setPhase("complete");
  };

  const startOver = () => {
    setPhase("goal");
    setSelectedGoal(null);
    setMoves([]);
    setError(null);
  };

  if (phase === "goal") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Find the opportunities actually worth your time.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/40">
            Opp Scout ranks internships, startup roles, hackathons, fellowships,
            scholarships, research opportunities, and paid gigs based on your
            goals.
          </p>
        </header>

        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/25">
          What&apos;s your goal right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {STUDENT_GOALS.map((goal) => (
            <button key={goal} type="button" onClick={() => selectGoal(goal)}>
              <Badge variant="default" className="cursor-pointer px-3 py-1.5 text-sm">
                {goal}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "onboarding") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {selectedGoal}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Tell us a bit about you
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            Five quick fields — we&apos;ll rank your best moves for the week.
          </p>
        </header>

        <div className="space-y-4">
          <Field label="School" value={profile.school} onChange={(v) => updateProfile("school", v)} placeholder="e.g. UT Dallas" />
          <Field label="Major" value={profile.major} onChange={(v) => updateProfile("major", v)} placeholder="e.g. Computer Science" />
          <Field label="Graduation year" value={profile.graduationYear} onChange={(v) => updateProfile("graduationYear", v)} placeholder="e.g. 2027" />
          <Field label="Location" value={profile.location} onChange={(v) => updateProfile("location", v)} placeholder="e.g. Dallas, TX" />
          <Field label="Skills" value={profile.skills} onChange={(v) => updateProfile("skills", v)} placeholder="e.g. Python, React, leadership" />
        </div>

        {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setPhase("goal")}>
            Back
          </Button>
          <Button size="sm" onClick={runRanking}>
            Show my top moves
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
      {phase === "running" && (
        <div className="space-y-8">
          <div className="flex items-center gap-2.5">
            <span className="thinking-dot" />
            <p className="text-sm text-white/50">{statusLine}</p>
          </div>
        </div>
      )}

      {phase === "complete" && (
        <div className="space-y-8">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-white/25">
              {selectedGoal}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your Top 5 Moves This Week
            </h1>
            <p className="text-[15px] leading-relaxed text-white/45">
              Ranked for {profile.major || "you"} at {profile.school || "your school"}.
              Start with #1 — highest score wins.
            </p>
          </header>

          <div className="space-y-3">
            {moves.map((opportunity, index) => (
              <MoveCard
                key={opportunity.id}
                opportunity={opportunity}
                rank={index + 1}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={startOver}>
              Start over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12"
      />
    </label>
  );
}
