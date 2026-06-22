"use client";

import { LeverageModal } from "@/components/leverage-modal";
import { OpportunityCard } from "@/components/opportunity-card";
import { TrajectorySection } from "@/components/trajectory-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getRecommendedOpportunities,
  OPPORTUNITY_DATABASE,
  searchAndFilterOpportunities,
} from "@/lib/opportunity-database";
import {
  generateTrajectory,
  toTrajectoryProfile,
} from "@/lib/generate-trajectory";
import {
  dismissOpportunity,
  loadDismissedIds,
  loadFeedProfile,
  loadSavedIds,
  saveFeedProfile,
  saveSubmission,
  toggleSaved,
  type FeedProfile,
} from "@/lib/opportunity-storage";
import {
  OPPORTUNITY_CATEGORIES,
  type OpportunityCategory,
  type ScoredOpportunity,
  type SecondaryFilter,
  type UserOpportunityProfile,
} from "@/lib/opportunity-types";
import { cn } from "@/lib/utils";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FeedSort =
  | "best_fit"
  | "deadline_soon"
  | "highest_upside"
  | "lowest_effort"
  | "newest";

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: "best_fit", label: "Best fit" },
  { value: "deadline_soon", label: "Deadline soon" },
  { value: "highest_upside", label: "Highest upside" },
  { value: "lowest_effort", label: "Lowest effort" },
  { value: "newest", label: "Newest" },
];

const SECONDARY_FILTERS: { id: SecondaryFilter | "all"; label: string }[] = [
  { id: "recommended", label: "Recommended for you" },
  { id: "deadline_soon", label: "Deadline soon" },
  { id: "high_upside", label: "High upside" },
  { id: "low_effort", label: "Low effort" },
  { id: "paid", label: "Paid" },
  { id: "remote", label: "Remote" },
  { id: "local", label: "Local" },
  { id: "weak_resume", label: "Good for weak resume" },
  { id: "ai", label: "Good for AI" },
];

const EMPTY_PROFILE: FeedProfile = {
  major: "",
  year: "",
  school: "",
  skills: "",
};

export function OpportunityFeedApp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "all">("all");
  const [secondary, setSecondary] = useState<SecondaryFilter | "all">("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<FeedProfile>(EMPTY_PROFILE);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    organization: "",
    link: "",
    category: "internships",
    deadline: "",
    notes: "",
  });
  const [submitDone, setSubmitDone] = useState(false);
  const [feedSort, setFeedSort] = useState<FeedSort>("best_fit");
  const [leverageOpen, setLeverageOpen] = useState(false);
  const [showSecondaryFilters, setShowSecondaryFilters] = useState(false);

  const openOpportunities = useMemo(
    () => OPPORTUNITY_DATABASE.filter((o) => o.status !== "closed"),
    [],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: openOpportunities.length };
    for (const opp of openOpportunities) {
      counts[opp.category] = (counts[opp.category] ?? 0) + 1;
    }
    return counts;
  }, [openOpportunities]);

  useEffect(() => {
    setSavedIds(loadSavedIds());
    setDismissedIds(loadDismissedIds());
    const saved = loadFeedProfile();
    if (saved) setProfile(saved);
  }, []);

  const userProfile: UserOpportunityProfile = useMemo(
    () => ({
      major: profile.major || undefined,
      year: profile.year || undefined,
      school: profile.school || undefined,
      skills: profile.skills || undefined,
    }),
    [profile],
  );

  const hasProfile = Boolean(
    profile.major || profile.year || profile.school || profile.skills,
  );

  const recommended = useMemo(
    () => getRecommendedOpportunities(userProfile, 5, dismissedIds),
    [userProfile, dismissedIds],
  );

  const feed = useMemo(() => {
    const base = searchAndFilterOpportunities({
      query,
      category,
      secondary,
      profile: userProfile,
      excludeIds: dismissedIds,
    });

    const sorted = [...base];
    switch (feedSort) {
      case "deadline_soon":
        sorted.sort((a, b) => {
          const da = a.deadlineISO
            ? new Date(a.deadlineISO).getTime()
            : Number.MAX_SAFE_INTEGER;
          const db = b.deadlineISO
            ? new Date(b.deadlineISO).getTime()
            : Number.MAX_SAFE_INTEGER;
          return da - db;
        });
        break;
      case "highest_upside":
        sorted.sort((a, b) => b.upsideScore - a.upsideScore);
        break;
      case "lowest_effort":
        sorted.sort((a, b) => a.effortScore - b.effortScore);
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        );
        break;
      default:
        sorted.sort((a, b) => b.personalizedFit - a.personalizedFit);
    }
    return sorted;
  }, [
    query,
    category,
    secondary,
    userProfile,
    dismissedIds,
    feedSort,
  ]);

  const allScored = useMemo(
    () =>
      searchAndFilterOpportunities({
        profile: userProfile,
        excludeIds: dismissedIds,
      }),
    [userProfile, dismissedIds],
  );

  const trajectoryBundle = useMemo(
    () => generateTrajectory(toTrajectoryProfile(profile), allScored),
    [profile, allScored],
  );

  const showPersonalizedSections =
    secondary === "all" && !query.trim() && category === "all";

  const handleSave = useCallback((id: string) => {
    setSavedIds(toggleSaved(id));
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(dismissOpportunity(id));
  }, []);

  const saveProfile = () => {
    saveFeedProfile(profile);
    setShowProfile(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.link.trim()) return;
    saveSubmission(submitForm);
    setSubmitDone(true);
    setSubmitForm({
      title: "",
      organization: "",
      link: "",
      category: "internships",
      deadline: "",
      notes: "",
    });
    setTimeout(() => {
      setSubmitDone(false);
      setShowSubmit(false);
    }, 2000);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSecondary("all");
    setFeedSort("best_fit");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-32 pt-12 sm:pt-16">
      {/* Hero */}
      <header className="mb-10 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/60">
            Opp Scout
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Find underrated opportunities before everyone else does.
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-white/40">
            Search internships, startup roles, hackathons, fellowships,
            scholarships, research, paid gigs, local jobs, and campus
            opportunities in one place.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role, org, tag, or location…"
            className="h-12 pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowProfile((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {hasProfile ? "Edit profile" : "Set profile for recommendations"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowSubmit(true)}>
            <Plus className="h-3.5 w-3.5" />
            Submit an opportunity
          </Button>
          {savedIds.length > 0 && (
            <span className="text-xs text-white/35">{savedIds.length} saved</span>
          )}
        </div>
      </header>

      {/* Profile panel */}
      {showProfile && (
        <section className="mb-8 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <p className="mb-3 text-sm font-medium text-white/80">
            Quick profile — powers recommendations & trajectory
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Major"
              value={profile.major}
              onChange={(major) => setProfile((p) => ({ ...p, major }))}
              placeholder="Computer Science"
            />
            <Field
              label="Year"
              value={profile.year}
              onChange={(year) => setProfile((p) => ({ ...p, year }))}
              placeholder="Sophomore"
            />
            <Field
              label="School"
              value={profile.school}
              onChange={(school) => setProfile((p) => ({ ...p, school }))}
              placeholder="Texas A&M"
            />
            <Field
              label="Skills / interests"
              value={profile.skills}
              onChange={(skills) => setProfile((p) => ({ ...p, skills }))}
              placeholder="python, ai, hackathons"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveProfile}>
              Save profile
            </Button>
          </div>
        </section>
      )}

      {/* Submit form modal-style panel */}
      {showSubmit && (
        <section className="mb-8 rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <p className="mb-3 text-sm font-medium text-white/80">
            Submit an opportunity
          </p>
          {submitDone ? (
            <p className="text-sm text-emerald-400/90">Thanks — saved locally for review.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field
                label="Title *"
                value={submitForm.title}
                onChange={(title) => setSubmitForm((f) => ({ ...f, title }))}
                placeholder="AWS Fall 2026 SDE Internship"
              />
              <Field
                label="Organization"
                value={submitForm.organization}
                onChange={(organization) =>
                  setSubmitForm((f) => ({ ...f, organization }))
                }
                placeholder="Amazon"
              />
              <Field
                label="Link *"
                value={submitForm.link}
                onChange={(link) => setSubmitForm((f) => ({ ...f, link }))}
                placeholder="https://…"
              />
              <Field
                label="Category"
                value={submitForm.category}
                onChange={(category) => setSubmitForm((f) => ({ ...f, category }))}
                placeholder="internships"
              />
              <Field
                label="Deadline"
                value={submitForm.deadline}
                onChange={(deadline) => setSubmitForm((f) => ({ ...f, deadline }))}
                placeholder="Rolling or Aug 1, 2026"
              />
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-white/30">
                  Notes
                </span>
                <textarea
                  value={submitForm.notes}
                  onChange={(e) =>
                    setSubmitForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Why is this worth adding?"
                  className="min-h-[72px] w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubmit(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Submit
                </Button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* Recommended trajectory */}
      {showPersonalizedSections && (
        <TrajectorySection bundle={trajectoryBundle} hasProfile={hasProfile} />
      )}

      {/* Top 5 recommended */}
      {showPersonalizedSections && recommended.length > 0 && (
        <section className="mb-10 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recommended for you
            </h2>
            <p className="text-sm text-white/40">
              Top 5 from the database
              {hasProfile ? " — personalized to your profile" : " — set a profile to personalize"}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((opp, i) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                rank={i + 1}
                saved={savedIds.includes(opp.id)}
                onSave={() => handleSave(opp.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category filters */}
      <section className="mb-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/25">
          Categories
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={`All (${categoryCounts.all ?? 0})`}
          />
          {OPPORTUNITY_CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              label={`${c.label} (${categoryCounts[c.id] ?? 0})`}
            />
          ))}
        </div>
      </section>

      {/* Secondary filters */}
      <section className="mb-8 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/25">
            Filters
          </p>
          <button
            type="button"
            className="text-xs text-violet-300/70 md:hidden"
            onClick={() => setShowSecondaryFilters((v) => !v)}
          >
            {showSecondaryFilters ? "Hide" : "Show filters"}
          </button>
        </div>
        <div
          className={cn(
            "flex flex-wrap gap-2",
            !showSecondaryFilters && "hidden md:flex",
          )}
        >
          <FilterChip
            active={secondary === "all"}
            onClick={() => setSecondary("all")}
            label="All"
          />
          {SECONDARY_FILTERS.map((f) => (
            <FilterChip
              key={f.id}
              active={secondary === f.id}
              onClick={() => setSecondary(f.id)}
              label={f.label}
            />
          ))}
        </div>
      </section>

      {/* Main feed */}
      <section className="space-y-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Student Opportunities</h2>
            <p className="text-sm text-white/40">
              {openOpportunities.length} curated · Updated today
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/45">
              Showing {feed.length} opportunities · Updated today
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={feedSort}
                onChange={(e) => setFeedSort(e.target.value as FeedSort)}
                className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 focus:border-white/20 focus:outline-none"
                aria-label="Sort opportunities"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0e0e12]">
                    Sort: {o.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={() => setLeverageOpen(true)}
                className="border border-violet-400/30 bg-violet-500/15 text-violet-100 hover:bg-violet-500/25"
              >
                Highest Leverage For Me →
              </Button>
            </div>
          </div>
        </div>

        {feed.length === 0 ? (
          <div className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-8 text-center">
            <p className="text-sm text-white/50">No matches for these filters.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSubmit(true)}>
                Submit an opportunity
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {feed.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                saved={savedIds.includes(opp.id)}
                onSave={() => handleSave(opp.id)}
              />
            ))}
          </div>
        )}
      </section>

      <LeverageModal
        open={leverageOpen}
        onClose={() => setLeverageOpen(false)}
        totalCount={openOpportunities.length}
        onProfileSaved={(p) => setProfile(p)}
      />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}>
      <Badge
        variant={active ? "active" : "default"}
        className={cn(
          "cursor-pointer px-3 py-1.5 text-xs sm:text-sm",
          active && "shadow-sm",
        )}
      >
        {label}
      </Badge>
    </button>
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
