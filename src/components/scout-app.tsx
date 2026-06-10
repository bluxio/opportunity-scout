"use client";

import { DiscoveryCard } from "@/components/discovery-card";
import { ResearchProcess } from "@/components/research-process";
import { ScoutBriefing } from "@/components/scout-briefing";
import { ScoutIntelligence } from "@/components/scout-intelligence";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OverlookedEmployerCard } from "@/components/overlooked-employer-card";
import {
  buildScoutIntelligence,
  buildSurfacedSignals,
  findMostOverlookedEmployer,
} from "@/lib/scout-intelligence";
import {
  OPPORTUNITY_CATEGORIES,
  type EmployerResearch,
  type OpportunityCategory,
  type ScoredOpportunity,
  type ScoutReport,
  type WorkflowEvent,
  type WorkflowStep,
} from "@/lib/types";
import { formatCategory } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

const INITIAL_STEPS: WorkflowStep[] = [
  { id: "discover_employers", label: "Scanning for hidden opportunities", status: "pending" },
  { id: "find_career_pages", label: "Checking employer career pages", status: "pending" },
  { id: "detect_hiring_signals", label: "Finding active openings", status: "pending" },
  { id: "find_opportunities", label: "Extracting opportunities", status: "pending" },
  { id: "generate_summaries", label: "Analyzing patterns", status: "pending" },
  { id: "rank_opportunities", label: "Ranking by relevance", status: "pending" },
  { id: "store_results", label: "Saving discoveries", status: "pending" },
];

const STRONG_MATCH_THRESHOLD = 82;

type AppPhase = "idle" | "running" | "complete" | "error";

function computeStrongMatches(opportunities: ScoredOpportunity[]) {
  return opportunities.filter((o) => o.fitScore >= STRONG_MATCH_THRESHOLD).length;
}

export function ScoutApp() {
  const [intent, setIntent] = useState("Part-time work near Allen, TX");
  const [location, setLocation] = useState("Allen, TX");
  const [radius, setRadius] = useState(15);
  const [categories, setCategories] = useState<OpportunityCategory[]>([
    "restaurant",
    "retail",
  ]);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [steps, setSteps] = useState<WorkflowStep[]>(INITIAL_STEPS);
  const [researchLog, setResearchLog] = useState<EmployerResearch[]>([]);
  const [opportunities, setOpportunities] = useState<ScoredOpportunity[]>([]);
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [statusLine, setStatusLine] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: OpportunityCategory) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleEvent = useCallback((event: WorkflowEvent) => {
    if (event.type === "step_update" && event.step && event.stepStatus) {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === event.step
            ? { ...step, status: event.stepStatus!, detail: event.message }
            : step,
        ),
      );
      if (event.stepStatus === "running") {
        const step = INITIAL_STEPS.find((s) => s.id === event.step);
        setStatusLine(event.message ?? step?.label);
      }
    }

    if (event.type === "employer_research" && event.employerResearch) {
      setResearchLog((prev) => {
        const last = prev[prev.length - 1];
        if (
          last?.employerId === event.employerResearch!.employerId &&
          last?.status === "checking" &&
          event.employerResearch!.status !== "checking"
        ) {
          return [...prev.slice(0, -1), event.employerResearch!];
        }
        if (
          prev.some(
            (e) =>
              e.employerId === event.employerResearch!.employerId &&
              e.status === event.employerResearch!.status &&
              e.message === event.employerResearch!.message,
          )
        ) {
          return prev;
        }
        return [...prev, event.employerResearch!];
      });
    }

    if (event.type === "opportunity" && event.opportunity) {
      setOpportunities((prev) => {
        const exists = prev.some((o) => o.id === event.opportunity!.id);
        if (exists) return prev;
        return [...prev, event.opportunity!].sort(
          (a, b) => b.fitScore - a.fitScore,
        );
      });
    }

    if (event.type === "complete" && event.session) {
      setOpportunities(event.session.opportunities);
      setResearchLog(event.session.employerResearch);
      setReport(event.session.report);
      setSteps(event.session.steps);
      setPhase("complete");
      setStatusLine(undefined);
    }

    if (event.type === "error") {
      setError(event.message ?? "Something went wrong");
      setPhase("error");
    }
  }, []);

  const runScout = async () => {
    if (categories.length === 0) {
      setError("Select at least one category to scout for");
      return;
    }

    setPhase("running");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setError(null);
    setResearchLog([]);
    setOpportunities([]);
    setReport(null);
    setStatusLine(undefined);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending", detail: undefined })));

    try {
      const response = await fetch("/api/scout/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, radius, categories, intent }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Scout failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as WorkflowEvent;
          handleEvent(event);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scout failed");
      setPhase("error");
    }
  };

  const isActive = phase === "running" || phase === "complete";

  const strongMatches = useMemo(
    () => report?.strongMatches ?? computeStrongMatches(opportunities),
    [report, opportunities],
  );

  const intelligence = useMemo(
    () =>
      buildScoutIntelligence({
        opportunities,
        categories,
        radius,
        location,
        strongMatchThreshold: STRONG_MATCH_THRESHOLD,
      }),
    [opportunities, categories, radius, location],
  );

  const overlookedEmployer = useMemo(
    () => findMostOverlookedEmployer(opportunities),
    [opportunities],
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-16 sm:pt-24">
      {!isActive && (
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Opportunity Scout
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/40">
            Discover opportunities around you that you would never have found
            manually — roles hiding on employer career pages, not job boards.
          </p>
        </header>
      )}

      <div className="mb-8">
        <Input
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && phase !== "running" && runScout()}
          placeholder="What opportunities are you looking for?"
          className="h-14 rounded-2xl px-5 text-[15px]"
          disabled={phase === "running"}
        />

        {!isActive && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-32 bg-transparent text-xs text-white/40 outline-none"
              placeholder="Location"
            />
            <span className="text-white/15">·</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/10 accent-white"
              />
              <span className="text-xs text-white/35">{radius} mi</span>
            </div>
            <span className="text-white/15">·</span>
            <div className="flex flex-wrap gap-1">
              {OPPORTUNITY_CATEGORIES.map((category) => {
                const active = categories.includes(category);
                return (
                  <button key={category} type="button" onClick={() => toggleCategory(category)}>
                    <Badge variant={active ? "active" : "default"}>
                      {formatCategory(category)}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={runScout} disabled={phase === "running"}>
            {phase === "running"
              ? "Scouting…"
              : phase === "complete"
                ? "Scout again"
                : "Start scouting"}
            {phase !== "running" && <ArrowRight className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {error && <p className="mt-3 text-sm text-red-400/90">{error}</p>}
      </div>

      {isActive && (
        <div className="space-y-8">
          <ScoutBriefing
            location={location}
            opportunities={opportunities}
            report={report}
            liveStrongMatches={strongMatches}
            isRunning={phase === "running"}
            statusLine={statusLine}
          />

          {(intelligence.length > 0 || (phase === "running" && opportunities.length > 0)) && (
            <ScoutIntelligence
              observations={intelligence}
              isRunning={phase === "running" && intelligence.length === 0}
            />
          )}

          {overlookedEmployer && (
            <OverlookedEmployerCard employer={overlookedEmployer} />
          )}

          {opportunities.length > 0 && (
            <section className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/25">
                  Discovered opportunities
                </p>
                <p className="mt-1 text-sm text-white/35">
                  Hidden roles you&apos;d likely miss without this scout
                </p>
              </div>
              <div className="space-y-3">
                {opportunities.map((opportunity) => (
                  <DiscoveryCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    surfacedSignals={buildSurfacedSignals(
                      opportunity,
                      categories,
                      radius,
                    )}
                    isStrongMatch={opportunity.fitScore >= STRONG_MATCH_THRESHOLD}
                  />
                ))}
              </div>
            </section>
          )}

          <ResearchProcess
            steps={steps}
            entries={researchLog}
            isRunning={phase === "running"}
          />
        </div>
      )}

      {!isActive && (
        <p className="text-xs text-white/20">
          An opportunity discovery agent — not a job board.
        </p>
      )}
    </div>
  );
}
