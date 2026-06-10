"use client";

import type { OverlookedEmployer } from "@/lib/scout-intelligence";

interface OverlookedEmployerCardProps {
  employer: OverlookedEmployer;
}

export function OverlookedEmployerCard({ employer }: OverlookedEmployerCardProps) {
  return (
    <article className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-5 py-5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
        Most overlooked employer
      </p>

      <p className="mt-2 text-lg font-medium tracking-tight text-white">
        {employer.company}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/45">
        <span>
          {employer.openingCount} active{" "}
          {employer.openingCount === 1 ? "opening" : "openings"}
        </span>
        <span className="text-white/20">·</span>
        <span>{employer.distanceMiles} miles away</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/50">
        Multiple roles surfaced from a single employer that most applicants
        would not monitor directly.
      </p>
    </article>
  );
}
