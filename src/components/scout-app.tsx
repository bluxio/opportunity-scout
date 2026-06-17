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
import type { ParsedResumeProfile } from "@/lib/resume-audit";
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
import { ArrowRight, FileUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AppPhase =
  | "bucket"
  | "resume"
  | "profile"
  | "parsing"
  | "resume-review"
  | "running"
  | "complete";

type PursuitChoice = "pursue" | "skip";

const FEEDBACK_STORAGE_KEY = "opp-scout-feedback-log";

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
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [choices, setChoices] = useState<Record<string, PursuitChoice>>({});
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
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

  const parseResumeFile = async (file: File) => {
    setParsing(true);
    setError(null);
    setPhase("parsing");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as {
        profile?: ParsedResumeProfile;
        error?: string;
      };

      if (!res.ok || !data.profile) {
        throw new Error(data.error ?? "Could not read resume.");
      }

      const parsed = data.profile;
      setProfile((prev) => ({
        ...prev,
        resumeFileName: file.name,
        parsedFromResume: true,
        year: parsed.year,
        major: parsed.major,
        majorCustom: parsed.majorCustom,
        school: parsed.school,
        location: parsed.location,
        skills: parsed.skills,
        timeline: parsed.timeline || "This month",
        resumeAudit: parsed.audit,
      }));
      setPhase("resume-review");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not read resume.",
      );
      setPhase("resume");
    } finally {
      setParsing(false);
    }
  };

  const handleResumeUpload = (file: File | null) => {
    if (!file) return;
    void parseResumeFile(file);
  };

  const skipResume = () => {
    setProfile((prev) => ({
      ...prev,
      resumeFileName: undefined,
      parsedFromResume: false,
      resumeAudit: undefined,
    }));
    setPhase("profile");
    setError(null);
  };

  const needsManualFields = (p: StudentProfile) =>
    !p.year || !p.major || !p.timeline;

  const runRanking = async () => {
    if (needsManualFields(profile)) {
      setError("We still need year, field, and timeline to rank opportunities.");
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
    setChoices({});
    setFeedbackSent(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    setMoves(rankOpportunitiesForProfile(profile, 5));
    setPhase("complete");
  };

  const startOver = () => {
    setPhase("bucket");
    setMoves([]);
    setChoices({});
    setFeedbackNote("");
    setFeedbackSent(false);
    setError(null);
  };

  const setPursuitChoice = (id: string, choice: PursuitChoice) => {
    setChoices((prev) => ({ ...prev, [id]: choice }));
  };

  const submitFeedback = async () => {
    setSubmittingFeedback(true);
    const pursued = Object.entries(choices)
      .filter(([, c]) => c === "pursue")
      .map(([id]) => id);
    const skipped = Object.entries(choices)
      .filter(([, c]) => c === "skip")
      .map(([id]) => id);

    const payload = {
      bucket: profile.bucket,
      pursued,
      skipped,
      note: feedbackNote,
      topMoves: moves.map((m) => m.id),
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const existing = JSON.parse(
        localStorage.getItem(FEEDBACK_STORAGE_KEY) ?? "[]",
      ) as unknown[];
      localStorage.setItem(
        FEEDBACK_STORAGE_KEY,
        JSON.stringify([...existing, payload]),
      );
      setFeedbackSent(true);
    } catch {
      setError("Could not send feedback — try again.");
    } finally {
      setSubmittingFeedback(false);
    }
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

  if (phase === "resume" || phase === "parsing") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {bucketLabel}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Upload your resume
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            We&apos;ll read it so you don&apos;t have to re-type your details.
            PDF works best.
          </p>
        </header>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleResumeUpload(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          disabled={parsing}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 transition-colors hover:border-white/25 hover:bg-white/[0.04] disabled:opacity-50"
        >
          {parsing ? (
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-white/40" />
          ) : (
            <FileUp className="mb-3 h-8 w-8 text-white/30" />
          )}
          <span className="text-sm font-medium text-white">
            {parsing ? "Reading resume…" : "Upload PDF resume"}
          </span>
          <span className="mt-1 text-xs text-white/35">
            {parsing ? "Quick profile + experience check" : "Max 4MB"}
          </span>
        </button>

        {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}

        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" onClick={skipResume} disabled={parsing}>
            No resume — answer 3 quick questions
          </Button>
        </div>

        <div className="mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPhase("bucket")}
            disabled={parsing}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "resume-review") {
    const audit = profile.resumeAudit;
    const showGaps = audit && audit.strength !== "strong" && audit.gaps.length > 0;

    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {bucketLabel}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            From your resume
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            Pulled from {profile.resumeFileName}. Fix anything that looks off.
          </p>
        </header>

        {audit && (
          <div
            className={cn(
              "mb-6 rounded-xl border px-4 py-3 text-sm",
              audit.strength === "weak"
                ? "border-amber-500/25 bg-amber-500/8 text-amber-100/90"
                : audit.strength === "developing"
                  ? "border-violet-500/20 bg-violet-500/6 text-white/75"
                  : "border-emerald-500/20 bg-emerald-500/6 text-white/75",
            )}
          >
            <p className="font-medium text-white/90">{audit.summary}</p>
            {showGaps && (
              <ul className="mt-2 list-inside list-disc text-white/55">
                {audit.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-white/50">{audit.suggestedFocus}</p>
          </div>
        )}

        <div className="space-y-6">
          {needsManualFields(profile) && (
            <>
              {!profile.year && (
                <ChipGroup
                  label="Year (couldn't detect)"
                  options={YEAR_LEVELS}
                  value={profile.year}
                  onChange={(year) =>
                    setProfile((prev) => ({ ...prev, year: year as YearLevel }))
                  }
                />
              )}
              {!profile.major && (
                <ChipGroup
                  label="Field (couldn't detect)"
                  options={MAJOR_CHIPS}
                  value={profile.major}
                  onChange={(major) => setProfile((prev) => ({ ...prev, major }))}
                />
              )}
              {!profile.timeline && (
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
              )}
            </>
          )}

          <dl className="grid gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm">
            {profile.year && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/30">Year</dt>
                <dd className="text-white/80">{profile.year}</dd>
              </div>
            )}
            {profile.major && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/30">Field</dt>
                <dd className="text-white/80">
                  {profile.major === "Other"
                    ? profile.majorCustom
                    : profile.major}
                </dd>
              </div>
            )}
            {profile.school && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/30">School</dt>
                <dd className="text-white/80">{profile.school}</dd>
              </div>
            )}
            {profile.skills && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/30">Skills</dt>
                <dd className="text-white/80">{profile.skills}</dd>
              </div>
            )}
            {profile.timeline && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/30">Timeline</dt>
                <dd className="text-white/80">{profile.timeline}</dd>
              </div>
            )}
          </dl>
        </div>

        {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => setPhase("resume")}>
            Re-upload
          </Button>
          <Button size="sm" onClick={runRanking}>
            Show my top moves
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "profile") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            {bucketLabel}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Quick context
          </h1>
          <p className="mt-2 text-[15px] text-white/40">
            Three taps — no resume needed.
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

          <div className="space-y-4 border-t border-white/6 pt-6">
            <Field
              label="School (optional)"
              value={profile.school ?? ""}
              onChange={(school) =>
                setProfile((prev) => ({ ...prev, school }))
              }
              placeholder="e.g. Texas A&M"
            />
            <Field
              label="Location (optional)"
              value={profile.location ?? ""}
              onChange={(location) =>
                setProfile((prev) => ({ ...prev, location }))
              }
              placeholder="e.g. College Station, TX"
            />
          </div>
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
          <p className="text-sm text-white/50">Ranking your top moves…</p>
        </div>
      )}

      {phase === "complete" && (
        <div className="space-y-8">
          <header className="space-y-3">
            <Badge variant="default" className="text-[10px] uppercase tracking-wider">
              Curated opportunities — verify deadlines on source
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
              on a {profile.timeline.toLowerCase()} timeline.
              {profile.resumeAudit?.strength === "weak"
                ? " Build-experience picks weighted higher for you."
                : " Start with #1."}
            </p>
          </header>

          <div className="space-y-4">
            {moves.map((opportunity, index) => (
              <div key={opportunity.id} className="space-y-2">
                <MoveCard opportunity={opportunity} rank={index + 1} />
                <div className="flex gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => setPursuitChoice(opportunity.id, "pursue")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      choices[opportunity.id] === "pursue"
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                        : "border-white/10 text-white/45 hover:border-white/20",
                    )}
                  >
                    I&apos;d pursue this
                  </button>
                  <button
                    type="button"
                    onClick={() => setPursuitChoice(opportunity.id, "skip")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      choices[opportunity.id] === "skip"
                        ? "border-white/25 bg-white/10 text-white/70"
                        : "border-white/10 text-white/45 hover:border-white/20",
                    )}
                  >
                    Not for me
                  </button>
                </div>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-4 space-y-3">
            <p className="text-sm font-medium text-white/80">
              Quick feedback — helps us learn what you actually want
            </p>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="e.g. I only care about AI internships, or I'd rather get a weekly email"
              className="min-h-[72px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
              maxLength={500}
            />
            {feedbackSent ? (
              <p className="text-sm text-emerald-400/90">Thanks — feedback saved.</p>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                disabled={submittingFeedback}
                onClick={submitFeedback}
              >
                {submittingFeedback ? "Sending…" : "Send feedback"}
              </Button>
            )}
          </section>

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
