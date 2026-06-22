"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OPPORTUNITY_DATABASE } from "@/lib/opportunity-database";
import {
  modalSignalLine,
  profileGoalLabel,
  rankForProfile,
  type LeverageRankedOpportunity,
  type ProfileGoal,
} from "@/lib/rank-for-profile";
import {
  loadFeedProfile,
  saveFeedProfile,
  type FeedProfile,
} from "@/lib/opportunity-storage";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const GOAL_OPTIONS: { value: ProfileGoal; label: string }[] = [
  { value: "big_tech", label: "Big Tech Internship" },
  { value: "research", label: "Research" },
  { value: "startup", label: "Startup" },
  { value: "money", label: "Make Money Fast" },
  { value: "grad_school", label: "Graduate School" },
  { value: "exploring", label: "Still figuring it out" },
];

const YEAR_OPTIONS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
];

interface LeverageModalProps {
  open: boolean;
  onClose: () => void;
  totalCount: number;
  onProfileSaved?: (profile: FeedProfile) => void;
}

function hasLeverageProfile(p: FeedProfile): p is FeedProfile & { goal: ProfileGoal } {
  return Boolean(p.school && p.major && p.year && p.goal);
}

export function LeverageModal({
  open,
  onClose,
  totalCount,
  onProfileSaved,
}: LeverageModalProps) {
  const [form, setForm] = useState<FeedProfile>({
    school: "",
    major: "",
    year: "",
    skills: "",
    goal: undefined,
  });
  const [showForm, setShowForm] = useState(true);
  const [results, setResults] = useState<LeverageRankedOpportunity[]>([]);

  useEffect(() => {
    if (!open) return;
    const saved = loadFeedProfile();
    if (saved && hasLeverageProfile(saved)) {
      setForm(saved);
      setShowForm(false);
      runRank(saved);
    } else if (saved) {
      setForm(saved);
      setShowForm(true);
      setResults([]);
    } else {
      setShowForm(true);
      setResults([]);
    }
  }, [open]);

  const runRank = (p: FeedProfile & { goal: ProfileGoal }) => {
    const ranked = rankForProfile(
      OPPORTUNITY_DATABASE,
      {
        school: p.school,
        major: p.major,
        year: p.year,
        goal: p.goal,
      },
      5,
    );
    setResults(ranked);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.school || !form.major || !form.year || !form.goal) return;
    saveFeedProfile(form);
    onProfileSaved?.(form);
    setShowForm(false);
    runRank(form as FeedProfile & { goal: ProfileGoal });
  };

  const profileLine = useMemo(() => {
    if (!form.school && !form.major) return "";
    const parts = [
      form.school,
      form.major,
      form.year,
      form.goal ? profileGoalLabel(form.goal) : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }, [form]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leverage-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#0e0e12] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="leverage-modal-title" className="text-lg font-semibold text-white">
              Highest leverage for you
            </h2>
            {!showForm && profileLine && (
              <p className="mt-1 text-sm text-white/45">
                For you — {profileLine}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:bg-white/8 hover:text-white/70"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label="School"
              value={form.school}
              onChange={(school) => setForm((f) => ({ ...f, school }))}
              placeholder="e.g. Texas A&M"
            />
            <Field
              label="Major"
              value={form.major}
              onChange={(major) => setForm((f) => ({ ...f, major }))}
              placeholder="e.g. Computer Science"
            />
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                Year
              </span>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="">Select year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                Goal
              </span>
              <select
                value={form.goal ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    goal: e.target.value as ProfileGoal,
                  }))
                }
                className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value="">Select goal</option>
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" className="mt-2 w-full">
              Show my top 5 →
            </Button>
          </form>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm text-white/50">
                Out of {totalCount} opportunities, these 5 matter most right now:
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="shrink-0 text-xs text-violet-300/80 hover:text-violet-200"
              >
                Update profile
              </button>
            </div>
            <ol className="space-y-4">
              {results.map((opp, i) => (
                <li
                  key={opp.id}
                  className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        <span className="text-violet-300/70">#{i + 1}</span>{" "}
                        {opp.title}
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {modalSignalLine(opp)}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                        &ldquo;{opp.leverageReason}&rdquo;
                      </p>
                    </div>
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-violet-300 hover:text-violet-200"
                    >
                      Apply
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 text-xs text-white/35 hover:text-white/55"
            >
              Not you? Change profile
            </button>
          </>
        )}
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
        className="h-10"
      />
    </label>
  );
}
