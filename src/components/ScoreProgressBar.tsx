import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

function getBarColor(score: number) {
  if (score >= 85) return "bg-[hsl(var(--success))]";
  if (score >= 70) return "bg-[hsl(var(--warning))]";
  return "bg-[hsl(var(--destructive))]";
}

export function ScoreProgressBar({ score, className }: Props) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", getBarColor(score))}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}
