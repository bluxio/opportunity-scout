"use client";

import type { Trajectory, TrajectoryBundle } from "@/lib/generate-trajectory";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

const VARIANT_LABEL: Record<Trajectory["variant"], string> = {
  primary: "Primary path",
  alternative: "Alternative",
  contrarian: "Contrarian",
};

const VARIANT_STYLE: Record<Trajectory["variant"], string> = {
  primary: "border-violet-500/20 bg-violet-500/6",
  alternative: "border-white/8 bg-white/[0.02]",
  contrarian: "border-amber-500/15 bg-amber-500/5",
};

function TrajectoryCard({ trajectory }: { trajectory: Trajectory }) {
  if (trajectory.steps.length === 0) return null;

  return (
    <article
      className={cn(
        "rounded-xl border px-4 py-4",
        VARIANT_STYLE[trajectory.variant],
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/35">
        {VARIANT_LABEL[trajectory.variant]}
      </p>
      <h3 className="mt-1 text-base font-semibold text-white">{trajectory.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{trajectory.whyChosen}</p>

      <ol className="mt-4 space-y-3">
        {trajectory.steps.map((step) => (
          <li key={step.opportunity.id} className="flex gap-3 text-sm">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[11px] font-medium text-white/60">
              {step.order}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white/90">{step.opportunity.title}</p>
              <p className="mt-0.5 text-xs text-white/40">{step.action}</p>
              <a
                href={step.opportunity.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-xs text-violet-300/80 hover:text-violet-200"
              >
                View in database
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-lg border border-white/6 bg-black/20 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
          Expected outcome
        </p>
        <p className="mt-1 text-sm text-white/60">{trajectory.expectedOutcome}</p>
      </div>
    </article>
  );
}

interface TrajectorySectionProps {
  bundle: TrajectoryBundle;
  hasProfile: boolean;
}

export function TrajectorySection({ bundle, hasProfile }: TrajectorySectionProps) {
  const trajectories = [bundle.primary, bundle.alternative, bundle.contrarian].filter(
    (t) => t.steps.length > 0,
  );

  if (trajectories.length === 0) return null;

  return (
    <section className="mb-10 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Recommended trajectory</h2>
        <p className="text-sm text-white/40">
          What should you do next?
          {hasProfile
            ? " — sequenced from your profile and the database"
            : " — set a profile to personalize"}
        </p>
      </div>
      <div className="space-y-3">
        {trajectories.map((t) => (
          <TrajectoryCard key={t.variant} trajectory={t} />
        ))}
      </div>
    </section>
  );
}
