"use client";

interface ScoutIntelligenceProps {
  observations: string[];
  isRunning: boolean;
}

export function ScoutIntelligence({
  observations,
  isRunning,
}: ScoutIntelligenceProps) {
  if (observations.length === 0 && !isRunning) return null;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-white/25">
          Scout intelligence
        </p>
        <p className="mt-1 text-sm text-white/35">
          What deserves your attention right now, and why
        </p>
      </div>

      {observations.length > 0 ? (
        <ul className="space-y-2.5">
          {observations.map((observation) => (
            <li
              key={observation}
              className="text-sm leading-relaxed text-white/55 animate-in"
            >
              {observation}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/30">
          Analyzing patterns as opportunities are discovered…
        </p>
      )}
    </section>
  );
}
