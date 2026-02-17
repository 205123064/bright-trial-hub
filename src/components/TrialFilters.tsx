import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TrialFilters as TF } from "@/types/clinical-trial";

interface Props {
  filters: TF;
  locations: string[];
  onChange: (filters: TF) => void;
}

export function TrialFilters({ filters, locations, onChange }: Props) {
  const update = (partial: Partial<TF>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trials..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="pl-9 bg-card"
        />
      </div>
      <Select value={filters.phase || "all"} onValueChange={(v) => update({ phase: v === "all" ? "" : v as any })}>
        <SelectTrigger className="w-[130px] bg-card"><SelectValue placeholder="Phase" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Phases</SelectItem>
          <SelectItem value="Phase I">Phase I</SelectItem>
          <SelectItem value="Phase II">Phase II</SelectItem>
          <SelectItem value="Phase III">Phase III</SelectItem>
          <SelectItem value="Phase IV">Phase IV</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.status || "all"} onValueChange={(v) => update({ status: v === "all" ? "" : v as any })}>
        <SelectTrigger className="w-[140px] bg-card"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Recruiting">Recruiting</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filters.location || "all"} onValueChange={(v) => update({ location: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[160px] bg-card"><SelectValue placeholder="Location" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.sortBy} onValueChange={(v) => update({ sortBy: v as any })}>
        <SelectTrigger className="w-[150px] bg-card"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Sort By: Newest</SelectItem>
          <SelectItem value="oldest">Sort By: Oldest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
