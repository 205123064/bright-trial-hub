export type TrialPhase = "Phase I" | "Phase II" | "Phase III" | "Phase IV";
export type TrialStatus = "Recruiting" | "Active" | "Completed" | "Closed";

export interface TrialBasicInfo {
  title: string;
  phase: TrialPhase;
  status: TrialStatus;
  condition: string;
  location: string;
  enrollment: number;
  startDate: string;
  description?: string;
  agesEligible?: string;
  sexesEligible?: string;
  acceptsHealthyVolunteers?: boolean;
}

export interface EligibilityCriteria {
  inclusion: string[];
  exclusion: string[];
}

export interface StudyPlan {
  primaryPurpose: string;
  allocation: string;
  interventionalModel: string;
  masking: string;
  interventionDescription: string;
  arms: string;
  interventionType: string;
  otherNames: string;
}

export interface Outcome {
  id: string;
  name: string;
  description: string;
  timeFrame: string;
}

export interface TrialOutcomes {
  primary: Outcome[];
  secondary: Outcome[];
}

export interface ClinicalEntity {
  entityType: string;
  name: string;
  severity: string;
  duration: string;
  temporalContext: string;
  negated: boolean;
}

export interface Patient {
  id: string;
  age: number;
  sex: string;
  topicId: string;
  rankingScore: number;
  semanticRepresentations: string[];
  clinicalEntities: ClinicalEntity[];
}

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
  agesEligible?: string;
  sexesEligible?: string;
  acceptsHealthyVolunteers?: boolean;
  eligibility?: EligibilityCriteria;
  studyPlan?: StudyPlan;
  outcomes?: TrialOutcomes;
  participants?: Patient[];
}

export interface TrialFilters {
  search: string;
  phase: TrialPhase | "";
  status: TrialStatus | "";
  location: string;
  sortBy: "newest" | "oldest";
}
