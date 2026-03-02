import { cn } from "@/lib/utils";

interface Props {
  score: number;
  className?: string;
}

function getScoreConfig(score: number) {
  if (score >= 85) return { label: "Excellent", bg: "bg-[hsl(var(--success))]", text: "text-[hsl(var(--success-foreground))]" };
  if (score >= 70) return { label: "Moderate", bg: "bg-[hsl(var(--warning))]", text: "text-[hsl(var(--warning-foreground))]" };
  return { label: "Low", bg: "bg-[hsl(var(--destructive))]", text: "text-[hsl(var(--destructive-foreground))]" };
}

export function ScoreBadge({ score, className }: Props) {
  const config = getScoreConfig(score);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", config.bg, config.text, className)}>
      {score} – {config.label}
    </span>
  );
}

export { getScoreConfig };
