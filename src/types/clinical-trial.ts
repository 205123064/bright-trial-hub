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

// ── Rich patient data types ──

export interface Diagnosis {
  name: string;
  stage?: string;
  active: boolean;
}

export interface PerformanceStatus {
  ecog?: number;
  karnofsky?: number;
}

export interface LabResult {
  test: string;
  value: number;
  unit: string;
  abnormal: boolean;
  date: string;
}

export interface ImagingFinding {
  modality: string;
  finding: string;
  date: string;
}

export interface Treatment {
  drug: string;
  line: number;
  startDate: string;
  endDate?: string;
  response: "CR" | "PR" | "SD" | "PD" | "Unknown";
}

export type EligibilityDecision = "Yes" | "No" | "Unknown";

export interface CriterionResult {
  criterion: string;
  decision: EligibilityDecision;
  justification: string;
  evidence: string;
  timestamp: string;
  modelVersion: string;
}

export interface EligibilitySummary {
  met: number;
  failed: number;
  unknown: number;
}

export interface ExclusionSummary {
  violated: number;
  safe: number;
  unknown: number;
}

export interface EligibilityBreakdown {
  inclusionSummary: EligibilitySummary;
  exclusionSummary: ExclusionSummary;
  inclusionCriteria: CriterionResult[];
  exclusionCriteria: CriterionResult[];
  blockingReasons: string[];
  missingInformation: string[];
}

export interface ScoreBreakdown {
  eligibilityScore: number;
  clinicalQualityScore: number;
  biomarkerFitScore: number;
  riskPenalty: number;
  operationalScore: number;
}

export type EligibilityStatus = "Eligible" | "Not Eligible" | "Uncertain";

export interface Patient {
  id: string;
  age: number;
  sex: string;
  topicId: string;
  rankingScore: number;
  eligibilityStatus: EligibilityStatus;
  primaryDiagnosis: string;
  ecog: number;
  riskFlag: boolean;
  semanticRepresentations: string[];
  clinicalEntities: ClinicalEntity[];
  diagnoses: Diagnosis[];
  performanceStatus: PerformanceStatus;
  comorbidities: string[];
  labResults: LabResult[];
  imagingFindings: ImagingFinding[];
  treatments: Treatment[];
  eligibilityBreakdown: EligibilityBreakdown;
  scoreBreakdown: ScoreBreakdown;
  lastEvaluated: string;
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
