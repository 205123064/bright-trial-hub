import React, { createContext, useContext, useState, useCallback } from "react";
import type { ClinicalTrial, Patient } from "@/types/clinical-trial";

const MOCK_PATIENTS: Patient[] = [
  {
    id: "P001", age: 45, sex: "Male", topicId: "T-101", rankingScore: 92,
    eligibilityStatus: "Eligible", primaryDiagnosis: "Hodgkin Lymphoma", ecog: 1, riskFlag: false,
    lastEvaluated: "2026-02-28T14:30:00Z",
    semanticRepresentations: ["Lymphoma staging", "Immunotherapy candidate", "PET scan positive"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Moderate", duration: "6 months", temporalContext: "Current", negated: false },
      { entityType: "Symptom", name: "Night sweats", severity: "Mild", duration: "3 months", temporalContext: "Recent", negated: false },
      { entityType: "Condition", name: "Diabetes", severity: "N/A", duration: "N/A", temporalContext: "N/A", negated: true },
    ],
    diagnoses: [
      { name: "Hodgkin Lymphoma", stage: "IIB", active: true },
    ],
    performanceStatus: { ecog: 1, karnofsky: 80 },
    comorbidities: ["Mild hypertension"],
    labResults: [
      { test: "WBC", value: 6.2, unit: "10^3/µL", abnormal: false, date: "2026-02-20" },
      { test: "Hemoglobin", value: 11.8, unit: "g/dL", abnormal: true, date: "2026-02-20" },
      { test: "Platelets", value: 210, unit: "10^3/µL", abnormal: false, date: "2026-02-20" },
      { test: "LDH", value: 280, unit: "U/L", abnormal: true, date: "2026-02-20" },
    ],
    imagingFindings: [
      { modality: "PET/CT", finding: "Mediastinal mass 4.2cm, SUVmax 12.3", date: "2026-02-15" },
      { modality: "CT Chest", finding: "Bilateral hilar lymphadenopathy", date: "2026-02-10" },
    ],
    treatments: [],
    eligibilityBreakdown: {
      inclusionSummary: { met: 4, failed: 0, unknown: 0 },
      exclusionSummary: { violated: 0, safe: 4, unknown: 0 },
      blockingReasons: [],
      missingInformation: [],
      inclusionCriteria: [
        { criterion: "Confirmed diagnosis of classical Hodgkin Lymphoma", decision: "Yes", justification: "Biopsy confirmed cHL diagnosis", evidence: "Pathology report 2026-01-10", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "Age 18-65 years", decision: "Yes", justification: "Patient age 45", evidence: "Demographics", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "ECOG performance status 0-2", decision: "Yes", justification: "ECOG 1", evidence: "Clinical assessment", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "Adequate organ function", decision: "Yes", justification: "All labs within acceptable range", evidence: "Lab panel 2026-02-20", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
      ],
      exclusionCriteria: [
        { criterion: "Prior immunotherapy treatment", decision: "No", justification: "Treatment naïve", evidence: "Medical history", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "Active autoimmune disease", decision: "No", justification: "No autoimmune history", evidence: "Medical history", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "Known HIV, Hepatitis B or C", decision: "No", justification: "Negative serology", evidence: "Lab results", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
        { criterion: "Pregnant or breastfeeding", decision: "No", justification: "Male patient", evidence: "Demographics", timestamp: "2026-02-28T14:30:00Z", modelVersion: "v2.1.0" },
      ],
    },
    scoreBreakdown: { eligibilityScore: 100, clinicalQualityScore: 88, biomarkerFitScore: 90, riskPenalty: 5, operationalScore: 95 },
  },
  {
    id: "P002", age: 62, sex: "Female", topicId: "T-102", rankingScore: 74,
    eligibilityStatus: "Uncertain", primaryDiagnosis: "Hodgkin Lymphoma", ecog: 2, riskFlag: true,
    lastEvaluated: "2026-02-27T10:15:00Z",
    semanticRepresentations: ["Advanced stage", "Prior chemotherapy", "ECOG 1"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Severe", duration: "12 months", temporalContext: "Current", negated: false },
      { entityType: "Procedure", name: "Chemotherapy", severity: "N/A", duration: "6 months", temporalContext: "Past", negated: false },
    ],
    diagnoses: [
      { name: "Hodgkin Lymphoma", stage: "IIIA", active: true },
      { name: "Hypothyroidism", active: true },
    ],
    performanceStatus: { ecog: 2, karnofsky: 70 },
    comorbidities: ["Hypothyroidism", "Osteoporosis"],
    labResults: [
      { test: "WBC", value: 3.1, unit: "10^3/µL", abnormal: true, date: "2026-02-22" },
      { test: "Hemoglobin", value: 9.4, unit: "g/dL", abnormal: true, date: "2026-02-22" },
      { test: "Creatinine", value: 1.1, unit: "mg/dL", abnormal: false, date: "2026-02-22" },
    ],
    imagingFindings: [
      { modality: "PET/CT", finding: "Multiple lymph node involvement, splenic uptake", date: "2026-02-18" },
    ],
    treatments: [
      { drug: "ABVD", line: 1, startDate: "2025-06-01", endDate: "2025-12-01", response: "PR" },
    ],
    eligibilityBreakdown: {
      inclusionSummary: { met: 3, failed: 0, unknown: 1 },
      exclusionSummary: { violated: 0, safe: 3, unknown: 1 },
      blockingReasons: [],
      missingInformation: ["Organ function labs incomplete – thyroid panel pending"],
      inclusionCriteria: [
        { criterion: "Confirmed diagnosis of classical Hodgkin Lymphoma", decision: "Yes", justification: "Confirmed cHL", evidence: "Pathology", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "Age 18-65 years", decision: "Yes", justification: "Patient age 62", evidence: "Demographics", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "ECOG performance status 0-2", decision: "Yes", justification: "ECOG 2 – borderline", evidence: "Clinical assessment", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "Adequate organ function", decision: "Unknown", justification: "Thyroid panel results pending", evidence: "Pending labs", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
      ],
      exclusionCriteria: [
        { criterion: "Prior immunotherapy treatment", decision: "No", justification: "Only prior ABVD chemo", evidence: "Treatment history", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "Active autoimmune disease", decision: "Unknown", justification: "Hypothyroidism may be autoimmune – needs clarification", evidence: "Medical history", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "Known HIV, Hepatitis B or C", decision: "No", justification: "Negative", evidence: "Lab results", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
        { criterion: "Pregnant or breastfeeding", decision: "No", justification: "Post-menopausal", evidence: "Demographics", timestamp: "2026-02-27T10:15:00Z", modelVersion: "v2.1.0" },
      ],
    },
    scoreBreakdown: { eligibilityScore: 75, clinicalQualityScore: 70, biomarkerFitScore: 72, riskPenalty: 15, operationalScore: 80 },
  },
  {
    id: "P003", age: 38, sex: "Male", topicId: "T-103", rankingScore: 85,
    eligibilityStatus: "Eligible", primaryDiagnosis: "Hodgkin Lymphoma", ecog: 0, riskFlag: false,
    lastEvaluated: "2026-02-28T09:00:00Z",
    semanticRepresentations: ["Early stage", "Treatment naïve", "Low tumor burden"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Mild", duration: "2 months", temporalContext: "Current", negated: false },
    ],
    diagnoses: [{ name: "Hodgkin Lymphoma", stage: "IA", active: true }],
    performanceStatus: { ecog: 0, karnofsky: 100 },
    comorbidities: [],
    labResults: [
      { test: "WBC", value: 7.5, unit: "10^3/µL", abnormal: false, date: "2026-02-25" },
      { test: "Hemoglobin", value: 14.2, unit: "g/dL", abnormal: false, date: "2026-02-25" },
      { test: "Platelets", value: 250, unit: "10^3/µL", abnormal: false, date: "2026-02-25" },
    ],
    imagingFindings: [
      { modality: "CT Neck", finding: "Single cervical lymph node enlargement 2.1cm", date: "2026-02-22" },
    ],
    treatments: [],
    eligibilityBreakdown: {
      inclusionSummary: { met: 4, failed: 0, unknown: 0 },
      exclusionSummary: { violated: 0, safe: 4, unknown: 0 },
      blockingReasons: [],
      missingInformation: [],
      inclusionCriteria: [
        { criterion: "Confirmed diagnosis of classical Hodgkin Lymphoma", decision: "Yes", justification: "Biopsy confirmed", evidence: "Pathology", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "Age 18-65 years", decision: "Yes", justification: "Age 38", evidence: "Demographics", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "ECOG performance status 0-2", decision: "Yes", justification: "ECOG 0", evidence: "Clinical assessment", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "Adequate organ function", decision: "Yes", justification: "All labs normal", evidence: "Lab panel", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
      ],
      exclusionCriteria: [
        { criterion: "Prior immunotherapy treatment", decision: "No", justification: "Treatment naïve", evidence: "Medical history", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "Active autoimmune disease", decision: "No", justification: "None", evidence: "Medical history", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "Known HIV, Hepatitis B or C", decision: "No", justification: "Negative", evidence: "Labs", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
        { criterion: "Pregnant or breastfeeding", decision: "No", justification: "Male", evidence: "Demographics", timestamp: "2026-02-28T09:00:00Z", modelVersion: "v2.1.0" },
      ],
    },
    scoreBreakdown: { eligibilityScore: 100, clinicalQualityScore: 82, biomarkerFitScore: 78, riskPenalty: 0, operationalScore: 92 },
  },
  {
    id: "P004", age: 55, sex: "Female", topicId: "T-104", rankingScore: 41,
    eligibilityStatus: "Not Eligible", primaryDiagnosis: "Hodgkin Lymphoma", ecog: 3, riskFlag: true,
    lastEvaluated: "2026-02-26T16:45:00Z",
    semanticRepresentations: ["Relapsed disease", "Stem cell transplant candidate"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Severe", duration: "18 months", temporalContext: "Recurrent", negated: false },
      { entityType: "Symptom", name: "Fatigue", severity: "Moderate", duration: "4 months", temporalContext: "Current", negated: false },
    ],
    diagnoses: [
      { name: "Hodgkin Lymphoma", stage: "IVB", active: true },
      { name: "Type 2 Diabetes", active: true },
    ],
    performanceStatus: { ecog: 3, karnofsky: 50 },
    comorbidities: ["Type 2 Diabetes", "Chronic kidney disease stage 2"],
    labResults: [
      { test: "WBC", value: 2.8, unit: "10^3/µL", abnormal: true, date: "2026-02-24" },
      { test: "Hemoglobin", value: 8.1, unit: "g/dL", abnormal: true, date: "2026-02-24" },
      { test: "Creatinine", value: 1.8, unit: "mg/dL", abnormal: true, date: "2026-02-24" },
      { test: "ALT", value: 65, unit: "U/L", abnormal: true, date: "2026-02-24" },
    ],
    imagingFindings: [
      { modality: "PET/CT", finding: "Extensive disease: multiple nodal + extranodal sites", date: "2026-02-20" },
      { modality: "MRI Brain", finding: "No CNS involvement", date: "2026-02-18" },
    ],
    treatments: [
      { drug: "ABVD", line: 1, startDate: "2024-12-01", endDate: "2025-06-01", response: "SD" },
      { drug: "Brentuximab vedotin", line: 2, startDate: "2025-07-01", endDate: "2025-12-01", response: "PD" },
    ],
    eligibilityBreakdown: {
      inclusionSummary: { met: 2, failed: 2, unknown: 0 },
      exclusionSummary: { violated: 1, safe: 3, unknown: 0 },
      blockingReasons: ["ECOG 3 exceeds maximum allowed (0-2)", "Inadequate organ function (elevated creatinine, ALT)"],
      missingInformation: [],
      inclusionCriteria: [
        { criterion: "Confirmed diagnosis of classical Hodgkin Lymphoma", decision: "Yes", justification: "Confirmed cHL", evidence: "Pathology", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "Age 18-65 years", decision: "Yes", justification: "Age 55", evidence: "Demographics", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "ECOG performance status 0-2", decision: "No", justification: "ECOG 3 – above threshold", evidence: "Clinical assessment", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "Adequate organ function", decision: "No", justification: "Elevated creatinine and ALT", evidence: "Lab panel 2026-02-24", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
      ],
      exclusionCriteria: [
        { criterion: "Prior immunotherapy treatment", decision: "Yes", justification: "Received Brentuximab vedotin (ADC with immunotherapy component)", evidence: "Treatment history", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "Active autoimmune disease", decision: "No", justification: "None", evidence: "Medical history", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "Known HIV, Hepatitis B or C", decision: "No", justification: "Negative", evidence: "Labs", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
        { criterion: "Pregnant or breastfeeding", decision: "No", justification: "Post-menopausal", evidence: "Demographics", timestamp: "2026-02-26T16:45:00Z", modelVersion: "v2.1.0" },
      ],
    },
    scoreBreakdown: { eligibilityScore: 40, clinicalQualityScore: 35, biomarkerFitScore: 50, riskPenalty: 30, operationalScore: 55 },
  },
];

const MOCK_TRIALS: ClinicalTrial[] = [
  {
    id: "1", title: "Advanced Immunotherapy Study", phase: "Phase II", status: "Recruiting",
    condition: "Classical Hodgkin Lymphoma", location: "Mumbai, India", enrollment: 120, startDate: "2026-01-15",
    description: "A study evaluating advanced immunotherapy approaches for classical Hodgkin Lymphoma patients.",
    agesEligible: "18-65 years", sexesEligible: "All", acceptsHealthyVolunteers: false,
    eligibility: {
      inclusion: [
        "Confirmed diagnosis of classical Hodgkin Lymphoma",
        "Age 18-65 years",
        "ECOG performance status 0-2",
        "Adequate organ function as defined by protocol",
      ],
      exclusion: [
        "Prior immunotherapy treatment",
        "Active autoimmune disease",
        "Known HIV, Hepatitis B or C infection",
        "Pregnant or breastfeeding",
      ],
    },
    studyPlan: {
      primaryPurpose: "Treatment",
      allocation: "Randomized",
      interventionalModel: "Parallel Assignment",
      masking: "Double Blind",
      interventionDescription: "Patients receive experimental immunotherapy agent XR-221 or placebo.",
      arms: "Experimental Arm A vs Placebo Arm B",
      interventionType: "Drug",
      otherNames: "XR-221, ImmunoBoost",
    },
    outcomes: {
      primary: [
        { id: "po1", name: "Overall Response Rate", description: "Proportion of patients with complete or partial response.", timeFrame: "6 months" },
      ],
      secondary: [
        { id: "so1", name: "Progression-Free Survival", description: "Time from randomization to disease progression or death.", timeFrame: "24 months" },
        { id: "so2", name: "Safety Profile", description: "Incidence and severity of adverse events.", timeFrame: "12 months" },
      ],
    },
    participants: MOCK_PATIENTS,
  },
  {
    id: "2", title: "Diabetes Treatment Trial", phase: "Phase III", status: "Active",
    condition: "Type 2 Diabetes", location: "New York, USA", enrollment: 200, startDate: "2023-09-01",
    description: "Investigating novel treatments for Type 2 Diabetes management.",
    agesEligible: "30-75 years", sexesEligible: "All", acceptsHealthyVolunteers: false,
    eligibility: { inclusion: ["Diagnosed with Type 2 Diabetes for at least 1 year", "HbA1c between 7.5-10%"], exclusion: ["Severe renal impairment", "Insulin-dependent"] },
    studyPlan: { primaryPurpose: "Treatment", allocation: "Randomized", interventionalModel: "Parallel Assignment", masking: "Single Blind", interventionDescription: "Oral medication vs standard care.", arms: "Treatment vs Control", interventionType: "Drug", otherNames: "GlucoReg-3" },
    outcomes: { primary: [{ id: "po1", name: "HbA1c Reduction", description: "Change in HbA1c from baseline.", timeFrame: "6 months" }], secondary: [{ id: "so1", name: "Weight Change", description: "Change in body weight.", timeFrame: "12 months" }] },
    participants: [],
  },
  {
    id: "3", title: "Alzheimer's Disease Study", phase: "Phase II", status: "Completed",
    condition: "Alzheimer's Disease", location: "Boston, MA", enrollment: 150, startDate: "2024-03-10",
    description: "Evaluating cognitive improvement therapies for early-stage Alzheimer's.",
    agesEligible: "55-85 years", sexesEligible: "All", acceptsHealthyVolunteers: false,
    eligibility: { inclusion: ["Early-stage Alzheimer's diagnosis", "MMSE score 20-26"], exclusion: ["Severe psychiatric disorder", "Active malignancy"] },
    studyPlan: { primaryPurpose: "Treatment", allocation: "Randomized", interventionalModel: "Crossover Assignment", masking: "Double Blind", interventionDescription: "Cognitive enhancement drug NeuroFix-7.", arms: "Drug-first vs Placebo-first", interventionType: "Drug", otherNames: "NeuroFix-7" },
    outcomes: { primary: [{ id: "po1", name: "ADAS-Cog Score Change", description: "Improvement in ADAS-Cog score.", timeFrame: "12 months" }], secondary: [] },
    participants: [],
  },
  { id: "4", title: "Lung Cancer Research", phase: "Phase I", status: "Recruiting", condition: "Non-Small Cell Lung Cancer", location: "Chicago, IL", enrollment: 80, startDate: "2023-11-20", description: "Phase I dose-escalation study for a novel lung cancer treatment." },
  { id: "5", title: "Cardiovascular Outcomes Trial", phase: "Phase IV", status: "Recruiting", condition: "Heart Disease", location: "Los Angeles, CA", enrollment: 300, startDate: "2024-07-05", description: "Post-marketing surveillance study for cardiovascular drug efficacy." },
  { id: "6", title: "Osteoarthritis Pain Study", phase: "Phase III", status: "Closed", condition: "Osteoarthritis", location: "London, UK", enrollment: 150, startDate: "2023-02-14", description: "Evaluating long-term pain management for osteoarthritis patients." },
  { id: "7", title: "Breast Cancer Vaccine Study", phase: "Phase I", status: "Recruiting", condition: "Breast Cancer", location: "Dallas, TX", enrollment: 60, startDate: "2025-05-01", description: "Exploring preventive vaccine candidates for breast cancer." },
  { id: "8", title: "COVID-19 Antiviral Trial", phase: "Phase II", status: "Active", condition: "COVID-19 Treatment", location: "San Francisco, CA", enrollment: 250, startDate: "2024-01-10", description: "Testing next-generation antiviral compounds against COVID-19." },
  { id: "9", title: "Multiple Sclerosis Therapy", phase: "Phase III", status: "Recruiting", condition: "Multiple Sclerosis", location: "Toronto, Canada", enrollment: 180, startDate: "2024-06-20", description: "Phase III trial for a novel MS disease-modifying therapy." },
];

interface TrialContextType {
  trials: ClinicalTrial[];
  addTrial: (trial: Omit<ClinicalTrial, "id">) => void;
  getTrialById: (id: string) => ClinicalTrial | undefined;
  updateTrial: (id: string, updates: Partial<ClinicalTrial>) => void;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [trials, setTrials] = useState<ClinicalTrial[]>(MOCK_TRIALS);

  const addTrial = useCallback((trial: Omit<ClinicalTrial, "id">) => {
    const newTrial: ClinicalTrial = { ...trial, id: Date.now().toString() };
    setTrials((prev) => [newTrial, ...prev]);
  }, []);

  const getTrialById = useCallback(
    (id: string) => trials.find((t) => t.id === id),
    [trials]
  );

  const updateTrial = useCallback((id: string, updates: Partial<ClinicalTrial>) => {
    setTrials((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  return (
    <TrialContext.Provider value={{ trials, addTrial, getTrialById, updateTrial }}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrials() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error("useTrials must be used within TrialProvider");
  return ctx;
}
