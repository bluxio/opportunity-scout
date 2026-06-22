"use client";

import { formatCategoryLabel } from "@/lib/opportunity-database";
import {
  formatDeadlinePill,
  getTopDnaPills,
  truncateWords,
} from "@/lib/rank-for-profile";
import type { ScoredOpportunity } from "@/lib/opportunity-types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Bookmark } from "lucide-react";

interface OpportunityCardProps {
  opportunity: ScoredOpportunity;
  rank?: number;
  saved?: boolean;
  onSave?: () => void;
  onDismiss?: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closing_soon: "Closing Soon",
  rolling: "Rolling",
  closed: "Closed",
};

export function OpportunityCard({
  opportunity,
  rank,
  saved = false,
  onSave,
}: OpportunityCardProps) {
  const dna = opportunity.dna;
  const pills = getTopDnaPills(dna, 3);
  const deadline = formatDeadlinePill(
    opportunity.deadlineISO,
    opportunity.status,
    opportunity.deadline,
  );
  const bestFor = truncateWords(opportunity.goodFor, 8);

  return (
    <article
      className="relative flex max-w-[360px] flex-col rounded-xl border border-white/6 bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/12"
      title={`Fit ${opportunity.personalizedFit}`}
    >
      {onSave && (
        <button
          type="button"
          onClick={onSave}
          className="absolute right-2.5 top-2.5 rounded-md p-1 text-white/35 transition-colors hover:bg-white/8 hover:text-white/70"
          aria-label={saved ? "Unsave" : "Save"}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-violet-300 text-violet-300")} />
        </button>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pr-8">
        {rank != null && (
          <span className="text-[10px] font-medium tabular-nums text-violet-300/80">
            #{rank}
          </span>
        )}
        <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/60">
          {formatCategoryLabel(opportunity.category)}
        </span>
        <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] text-white/45">
          {STATUS_LABEL[opportunity.status] ?? opportunity.status}
        </span>
        {opportunity.paid && (
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400/80">
            Paid
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-1 text-[15px] font-medium leading-snug text-white sm:line-clamp-2">
        {opportunity.title}
      </h3>
      <p className="mt-0.5 truncate text-[13px] text-white/45">
        {opportunity.organization}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/50">
          {opportunity.remote ? "Remote" : opportunity.location.split(",")[0]?.trim() || opportunity.location}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px]",
            deadline.variant === "urgent" &&
              "border border-red-500/30 bg-red-500/10 text-red-300/90",
            deadline.variant === "soon" &&
              "border border-amber-500/25 bg-amber-500/10 text-amber-200/90",
            (deadline.variant === "muted" || deadline.variant === "rolling") &&
              "border border-white/8 text-white/40",
          )}
        >
          {deadline.label}
        </span>
      </div>

      {pills.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {pills.map((p) => (
            <span
              key={p.abbrev}
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                p.value >= 8
                  ? "border border-violet-400/30 bg-violet-500/20 text-violet-200/90"
                  : "border border-white/12 text-white/50",
              )}
            >
              {p.abbrev} {p.value}
            </span>
          ))}
        </div>
      )}

      {bestFor && (
        <p className="mt-2 line-clamp-2 text-xs text-white/40">{bestFor}</p>
      )}

      <a
        href={opportunity.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] text-sm font-medium text-white transition-colors hover:border-violet-400/40 hover:bg-violet-500/10"
      >
        Apply
        <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}
