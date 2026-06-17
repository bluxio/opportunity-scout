"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCategoryLabel } from "@/lib/opportunity-database";
import type { ScoredOpportunity } from "@/lib/opportunity-types";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Bookmark, X } from "lucide-react";

interface OpportunityCardProps {
  opportunity: ScoredOpportunity;
  rank?: number;
  saved?: boolean;
  onSave?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  closing_soon: "Closing soon",
  rolling: "Rolling",
  closed: "Closed",
};

export function OpportunityCard({
  opportunity,
  rank,
  saved = false,
  onSave,
  onDismiss,
  compact = false,
}: OpportunityCardProps) {
  const statusVariant =
    opportunity.status === "closing_soon"
      ? "text-amber-300/80 border-amber-500/25 bg-amber-500/10"
      : opportunity.status === "rolling"
        ? "text-violet-300/80 border-violet-500/20 bg-violet-500/8"
        : "text-white/50 border-white/10 bg-white/5";

  return (
    <article
      className={cn(
        "animate-in rounded-xl border border-white/6 bg-white/[0.02] transition-colors hover:border-white/10",
        compact ? "px-4 py-3" : "px-4 py-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            {rank != null && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
                #{rank}
              </span>
            )}
            <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/70">
              {formatCategoryLabel(opportunity.category)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                statusVariant,
              )}
            >
              {STATUS_LABEL[opportunity.status] ?? opportunity.status}
            </span>
            {opportunity.isPlaceholder && (
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/40">
                Dev example
              </span>
            )}
            {opportunity.paid && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
                Paid
              </span>
            )}
            {opportunity.remote && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-sky-400/60">
                Remote
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white">{opportunity.title}</p>
          <p className="mt-0.5 text-sm text-white/45">{opportunity.organization}</p>
          <p className="mt-1 text-xs text-white/30">
            {opportunity.location}
            {opportunity.compensation ? ` · ${opportunity.compensation}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-medium tabular-nums text-emerald-400/90">
            {opportunity.personalizedFit}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/25">Fit</p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="mt-3 text-xs text-white/40">
            Found via{" "}
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/55 underline-offset-2 hover:text-white/75 hover:underline"
            >
              {opportunity.sourceName}
            </a>
          </p>

          <dl className="mt-4 space-y-3 text-xs">
            {opportunity.matchReason && (
              <div className="rounded-lg border border-violet-500/15 bg-violet-500/5 px-3 py-2.5">
                <dt className="font-medium uppercase tracking-wider text-violet-300/50">
                  Why recommended
                </dt>
                <dd className="mt-1 text-white/60">{opportunity.matchReason}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium uppercase tracking-wider text-white/25">
                Why it matters
              </dt>
              <dd className="mt-1 text-white/55">{opportunity.whyItMatters}</dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wider text-white/25">
                Good for
              </dt>
              <dd className="mt-1 text-white/55">{opportunity.goodFor}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="font-medium uppercase tracking-wider text-white/25">
                  Upside
                </dt>
                <dd className="mt-1 tabular-nums text-white/55">{opportunity.upsideScore}/100</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-wider text-white/25">
                  Effort
                </dt>
                <dd className="mt-1 tabular-nums text-white/55">{opportunity.effortScore}/100</dd>
              </div>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wider text-white/25">
                Deadline
              </dt>
              <dd className="mt-1 text-white/55">{opportunity.deadline}</dd>
            </div>
            <div className="rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2.5">
              <dt className="font-medium uppercase tracking-wider text-white/25">
                Next action
              </dt>
              <dd className="mt-1 text-sm text-white/70">{opportunity.nextAction}</dd>
            </div>
          </dl>

          {opportunity.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {opportunity.tags.slice(0, 6).map((tag) => (
                <Badge key={tag} variant="default" className="text-[10px] capitalize">
                  {tag.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          )}
        </>
      )}

      <div className={cn("flex gap-2", compact ? "mt-3" : "mt-4")}>
        <a
          href={opportunity.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 text-sm font-medium text-white transition-all hover:bg-white/12"
        >
          Apply / view
          <ArrowUpRight className="h-4 w-4" />
        </a>
        {onSave && (
          <Button
            type="button"
            variant={saved ? "default" : "secondary"}
            size="icon"
            onClick={onSave}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </Button>
        )}
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  );
}
