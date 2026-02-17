import type { TrialPhase } from "@/types/clinical-trial";

const phaseColors: Record<TrialPhase, string> = {
  "Phase I": "bg-[hsl(var(--phase-1))] text-[hsl(var(--info-foreground))]",
  "Phase II": "bg-[hsl(var(--phase-2))] text-[hsl(var(--primary-foreground))]",
  "Phase III": "bg-[hsl(var(--phase-3))] text-[hsl(var(--primary-foreground))]",
  "Phase IV": "bg-[hsl(var(--phase-4))] text-[hsl(var(--primary-foreground))]",
};

export function PhaseBadge({ phase }: { phase: TrialPhase }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${phaseColors[phase]}`}>
      {phase}
    </span>
  );
}
