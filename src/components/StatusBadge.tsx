import type { TrialStatus } from "@/types/clinical-trial";

const statusColors: Record<TrialStatus, string> = {
  Recruiting: "bg-[hsl(var(--status-recruiting))] text-[hsl(var(--success-foreground))]",
  Active: "bg-[hsl(var(--status-active))] text-[hsl(var(--info-foreground))]",
  Completed: "bg-[hsl(var(--status-completed))] text-[hsl(var(--primary-foreground))]",
  Closed: "bg-[hsl(var(--status-closed))] text-[hsl(var(--destructive-foreground))]",
};

export function StatusBadge({ status }: { status: TrialStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
      {status}
    </span>
  );
}
