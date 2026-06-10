"use client";

import type { ScoredOpportunity } from "@/lib/types";
import { ArrowUpRight, Check } from "lucide-react";

interface DiscoveryCardProps {
  opportunity: ScoredOpportunity;
  surfacedSignals: string[];
  isStrongMatch?: boolean;
}

export function DiscoveryCard({
  opportunity,
  surfacedSignals,
  isStrongMatch,
}: DiscoveryCardProps) {
  return (
    <article className="animate-in rounded-xl border border-white/6 bg-white/[0.02] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isStrongMatch && (
            <span className="mb-1.5 inline-block text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
              Strong match
            </span>
          )}
          <p className="text-sm font-medium text-white">{opportunity.title}</p>
          <p className="mt-0.5 text-sm text-white/45">
            {opportunity.company} · {opportunity.location}
          </p>
        </div>
        <a
          href={opportunity.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 shrink-0 text-white/20 transition-colors hover:text-white/40"
          aria-label={`View ${opportunity.company} careers page`}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
          Why it surfaced
        </p>
        <ul className="space-y-1.5">
          {surfacedSignals.map((signal) => (
            <li
              key={signal}
              className="flex items-center gap-2 text-xs text-white/45"
            >
              <Check className="h-3 w-3 shrink-0 text-emerald-400/50" />
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
