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
  GOAL_BUCKETS,
  MAJOR_CHIPS,
  TIMELINE_OPTIONS,
  YEAR_LEVELS,
  type GoalBucket,
  type RankedOpportunity,
  type StudentProfile,
  type TimelineOption,
  type YearLevel,
} from "@/lib/student-types";
import { cn } from "@/lib/utils";
import { ArrowRight, FileUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AppPhase = "bucket" | "resume" | "profile" | "running" | "complete";

const LOADING_LINES = [
  "Reading your context…",
  "Scoring fit, upside, and urgency…",
  "Picking your top moves for this week…",
];

const EMPTY_PROFILE: StudentProfile = {
  bucket: "explore",
  year: "",
  major: "",
  timeline: "",
};

export function ScoutApp() {
  const [phase, setPhase] = useState<AppPhase>("bucket");
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [moves, setMoves] = useState<RankedOpportunity[]>([]);
  const [statusLine, setStatusLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadStudentProfile();
    if (saved) setProfile(saved);
  }, []);

  const selectBucket = (bucket: GoalBucket) => {
    setProfile((prev) => ({ ...prev, bucket }));
    setError(null);
    setPhase("resume");
  };

  const handleResumeUpload = (file: File | null) => {
    if (!file) return;
    setProfile((prev) => ({ ...prev, resumeFileName: file.name }));
    setPhase("profile");
    setError(null);
  };

  const skipResume = () => {
    setProfile((prev) => ({ ...prev, resumeFileName: undefined }));
    setPhase("profile");
    setError(null);
  };

  const runRanking = async () => {
    if (!profile.year || !profile.major || !profile.timeline) {
      setError("Pick your year, field, and timeline to continue.");
      return;
    }

    if (profile.major === "Other" && !profile.majorCustom?.trim()) {
      setError("Tell us your field under Other.");
      return;
    }

    saveStudentProfile(profile);
    setPhase("running");
    setError(null);
    setMoves([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    for (let i = 0; i < LOADING_LINES.length; i++) {
      setStatusLine(LOADING_LINES[i]);
      await new Promise((resolve) => setTimeout(resolve, 900));
    }

    setMoves(rankOpportunitiesForProfile(profile, 5));
    setPhase("complete");
  };

  const startOver = () => {
    setPhase("bucket");
    setMoves([]);
    setError(null);
  };

  const bucketLabel =
    GOAL_BUCKETS.find((b) => b.id === profile.bucket)?.label ?? "";

  if (phase === "bucket") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Find the opportunities actually worth your time.
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/40">
            One question first — then we&apos;ll narrow your top moves for the
            week.
          </p>
        </header>

        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/25">
          What do you need most right now?
        </p>
        <div className="space-y-3">
          {GOAL_BUCKETS.map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              onClick={() => selectBucket(bucket.id)}
              className="w-full rounded-xl border border-white/8 bg-white/[0.02] px-4 py-4 text-left transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              <p className="text-sm font-medium text-white">{bucket.label}</p>
              <p className="mt-1 text-sm text-white/40">{bucket.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "resume") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {bucketLabel}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start with your resume
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            Upload now and we&apos;ll personalize from it soon. No resume? No
            problem — a few taps instead.
          </p>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleResumeUpload(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 transition-colors hover:border-white/25 hover:bg-white/[0.04]"
        >
          <FileUp className="mb-3 h-8 w-8 text-white/30" />
          <span className="text-sm font-medium text-white">Upload resume</span>
          <span className="mt-1 text-xs text-white/35">PDF or DOC</span>
        </button>

        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={skipResume}>
            Continue without resume
          </Button>
        </div>

        <div className="mt-6">
          <Button variant="ghost" size="sm" onClick={() => setPhase("bucket")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "profile") {
    const showManualFields = !profile.resumeFileName;

    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {bucketLabel}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {profile.resumeFileName ? "Almost there" : "Quick context"}
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            {profile.resumeFileName
              ? `Using ${profile.resumeFileName} — just confirm a few details.`
              : "Three taps — then your top moves."}
          </p>
        </header>

        <div className="space-y-6">
          <ChipGroup
            label="Year"
            options={YEAR_LEVELS}
            value={profile.year}
            onChange={(year) =>
              setProfile((prev) => ({ ...prev, year: year as YearLevel }))
            }
          />

          <ChipGroup
            label="Field"
            options={MAJOR_CHIPS}
            value={profile.major}
            onChange={(major) => setProfile((prev) => ({ ...prev, major }))}
          />

          {profile.major === "Other" && (
            <Field
              label="Your field"
              value={profile.majorCustom ?? ""}
              onChange={(majorCustom) =>
                setProfile((prev) => ({ ...prev, majorCustom }))
              }
              placeholder="e.g. Public Health"
            />
          )}

          <ChipGroup
            label="Timeline"
            options={TIMELINE_OPTIONS}
            value={profile.timeline}
            onChange={(timeline) =>
              setProfile((prev) => ({
                ...prev,
                timeline: timeline as TimelineOption,
              }))
            }
          />

          {showManualFields && (
            <div className="space-y-4 border-t border-white/6 pt-6">
              <Field
                label="School (optional)"
                value={profile.school ?? ""}
                onChange={(school) =>
                  setProfile((prev) => ({ ...prev, school }))
                }
                placeholder="e.g. UT Dallas"
              />
              <Field
                label="Location (optional)"
                value={profile.location ?? ""}
                onChange={(location) =>
                  setProfile((prev) => ({ ...prev, location }))
                }
                placeholder="e.g. Dallas, TX"
              />
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setPhase("resume")}>
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
        <div className="flex items-center gap-2.5">
          <span className="thinking-dot" />
          <p className="text-sm text-white/50">{statusLine}</p>
        </div>
      )}

      {phase === "complete" && (
        <div className="space-y-8">
          <header className="space-y-3">
            <Badge variant="default" className="text-[10px] uppercase tracking-wider">
              Sample recommendations — for testing
            </Badge>
            <p className="text-xs font-medium uppercase tracking-wider text-white/25">
              {bucketLabel}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your Top 5 Moves This Week
            </h1>
            <p className="text-[15px] leading-relaxed text-white/45">
              Picked for a {profile.year.toLowerCase()} studying{" "}
              {profile.major === "Other"
                ? profile.majorCustom
                : profile.major}{" "}
              on a {profile.timeline.toLowerCase()} timeline. Start with #1.
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

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-white/30">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button key={option} type="button" onClick={() => onChange(option)}>
              <Badge
                variant={active ? "active" : "default"}
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  active && "shadow-sm",
                )}
              >
                {option}
              </Badge>
            </button>
          );
        })}
      </div>
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
