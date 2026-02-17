export type TrialPhase = "Phase I" | "Phase II" | "Phase III" | "Phase IV";
export type TrialStatus = "Recruiting" | "Active" | "Completed" | "Closed";

export interface ClinicalTrial {
  id: string;
  title: string;
  phase: TrialPhase;
  status: TrialStatus;
  condition: string;
  location: string;
  enrollment: number;
  startDate: string;
  description?: string;
}

export interface TrialFilters {
  search: string;
  phase: TrialPhase | "";
  status: TrialStatus | "";
  location: string;
  sortBy: "newest" | "oldest";
}
