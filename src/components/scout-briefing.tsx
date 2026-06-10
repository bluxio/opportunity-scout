"use client";

import { cn } from "@/lib/utils";
import type { ScoutReport, ScoredOpportunity } from "@/lib/types";

interface ScoutBriefingProps {
  location: string;
  opportunities: ScoredOpportunity[];
  report: ScoutReport | null;
  liveStrongMatches: number;
  isRunning: boolean;
  statusLine?: string;
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "text-2xl font-medium tabular-nums tracking-tight",
          highlight ? "text-emerald-400/90" : "text-white",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-white/35">{label}</span>
    </div>
  );
}

export function ScoutBriefing({
  location,
  opportunities,
  report,
  liveStrongMatches,
  isRunning,
  statusLine,
}: ScoutBriefingProps) {
  const city = location.split(",")[0]?.trim() || location;
  const discovered = opportunities.length;
  const directPostings = discovered;
  const overlookedEmployers = new Set(opportunities.map((o) => o.company)).size;
  const strongMatches = report?.strongMatches ?? liveStrongMatches;

  return (
    <div className="space-y-6">
      {isRunning && (
        <div className="flex items-center gap-2.5">
          <span className="thinking-dot" />
          <p className="text-sm text-white/50">
            {statusLine ?? `Discovering hidden opportunities near ${city}…`}
          </p>
        </div>
      )}

      {!isRunning && discovered > 0 && (
        <p className="text-[15px] leading-relaxed text-white/60">
          {discovered} {discovered === 1 ? "opportunity" : "opportunities"} near{" "}
          {city} you&apos;d likely have missed.
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        <Stat label="Opportunities discovered" value={discovered} />
        <Stat label="Direct employer postings" value={directPostings} />
        <Stat
          label="Strong matches"
          value={strongMatches}
          highlight={strongMatches > 0}
        />
      </div>

      {overlookedEmployers > 0 && !isRunning && (
        <p className="text-sm text-white/40">
          Surfaced from {overlookedEmployers} overlooked{" "}
          {overlookedEmployers === 1 ? "employer" : "employers"} you
          wouldn&apos;t have checked manually.
        </p>
      )}
    </div>
  );
}
