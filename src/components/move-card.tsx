"use client";

import type { RankedOpportunity } from "@/lib/student-types";
import { formatCategory } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface MoveCardProps {
  opportunity: RankedOpportunity;
  rank: number;
}

export function MoveCard({ opportunity, rank }: MoveCardProps) {
  return (
    <article className="animate-in rounded-xl border border-white/6 bg-white/[0.02] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
              #{rank}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-violet-300/70">
              {formatCategory(opportunity.category)}
            </span>
          </div>
          <p className="text-sm font-medium text-white">{opportunity.title}</p>
          <p className="mt-0.5 text-sm text-white/45">{opportunity.organization}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-medium tabular-nums text-emerald-400/90">
            {opportunity.opportunityScore}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-white/25">
            Score
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-3 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wider text-white/25">
            Why it fits
          </dt>
          <dd className="mt-1 text-white/55">{opportunity.whyItFits}</dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <dt className="font-medium uppercase tracking-wider text-white/25">
              Estimated upside
            </dt>
            <dd className="mt-1 text-white/55">{opportunity.estimatedUpside}</dd>
          </div>
          <div>
            <dt className="font-medium uppercase tracking-wider text-white/25">
              Estimated effort
            </dt>
            <dd className="mt-1 text-white/55">{opportunity.estimatedEffort}</dd>
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

      <a
        href={opportunity.sourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/8 text-sm font-medium text-white transition-all hover:bg-white/12"
      >
        View opportunity
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </article>
  );
}
