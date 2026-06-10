"use client";

import { cn } from "@/lib/utils";
import type { EmployerResearch, WorkflowStep } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ResearchProcessProps {
  steps: WorkflowStep[];
  entries: EmployerResearch[];
  isRunning: boolean;
}

export function ResearchProcess({
  steps,
  entries,
  isRunning,
}: ResearchProcessProps) {
  const [open, setOpen] = useState(false);

  const hiringEntries = entries.filter((e) => e.status === "hiring");
  const checkedCount = new Set(
    entries.filter((e) => e.status !== "checking").map((e) => e.employerId),
  ).size;

  const label = isRunning
    ? "Scouting in progress…"
    : `${checkedCount} employers checked`;

  return (
    <div className="rounded-xl border border-white/6 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="text-sm text-white/45">How these were found</span>
        <span className="flex items-center gap-2 text-xs text-white/25">
          {label}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-white/6 px-4 py-3">
          <div className="mb-4 space-y-1">
            {steps
              .filter((s) => s.status === "complete" || s.status === "running")
              .map((step) => (
                <p
                  key={step.id}
                  className={cn(
                    "text-xs leading-relaxed",
                    step.status === "running" ? "text-white/40" : "text-white/25",
                  )}
                >
                  {step.detail ?? step.label}
                </p>
              ))}
          </div>

          {hiringEntries.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-[10px] uppercase tracking-wider text-white/20">
                Hiring signals
              </p>
              {hiringEntries.map((entry, i) => (
                <p key={`${entry.employerId}-${i}`} className="text-xs text-white/35">
                  {entry.message}
                </p>
              ))}
            </div>
          )}

          <p className="text-[10px] text-white/20">
            {checkedCount} employers checked
            {entries.filter((e) => e.status === "no_openings").length > 0 &&
              ` · ${entries.filter((e) => e.status === "no_openings").length} with no openings`}
          </p>
        </div>
      )}
    </div>
  );
}
