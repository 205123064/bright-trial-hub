import React, { createContext, useContext, useState, useCallback } from "react";
import type { ClinicalTrial, Patient } from "@/types/clinical-trial";

const MOCK_PATIENTS: Patient[] = [
  {
    id: "P001", age: 45, sex: "Male", topicId: "T-101", rankingScore: 92,
    semanticRepresentations: ["Lymphoma staging", "Immunotherapy candidate", "PET scan positive"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Moderate", duration: "6 months", temporalContext: "Current", negated: false },
      { entityType: "Symptom", name: "Night sweats", severity: "Mild", duration: "3 months", temporalContext: "Recent", negated: false },
      { entityType: "Condition", name: "Diabetes", severity: "N/A", duration: "N/A", temporalContext: "N/A", negated: true },
    ],
  },
  {
    id: "P002", age: 62, sex: "Female", topicId: "T-102", rankingScore: 74,
    semanticRepresentations: ["Advanced stage", "Prior chemotherapy", "ECOG 1"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Severe", duration: "12 months", temporalContext: "Current", negated: false },
      { entityType: "Procedure", name: "Chemotherapy", severity: "N/A", duration: "6 months", temporalContext: "Past", negated: false },
    ],
  },
  {
    id: "P003", age: 38, sex: "Male", topicId: "T-103", rankingScore: 85,
    semanticRepresentations: ["Early stage", "Treatment naïve", "Low tumor burden"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Mild", duration: "2 months", temporalContext: "Current", negated: false },
    ],
  },
  {
    id: "P004", age: 55, sex: "Female", topicId: "T-104", rankingScore: 41,
    semanticRepresentations: ["Relapsed disease", "Stem cell transplant candidate"],
    clinicalEntities: [
      { entityType: "Condition", name: "Hodgkin Lymphoma", severity: "Severe", duration: "18 months", temporalContext: "Recurrent", negated: false },
      { entityType: "Symptom", name: "Fatigue", severity: "Moderate", duration: "4 months", temporalContext: "Current", negated: false },
    ],
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
