import React, { createContext, useContext, useState, useCallback } from "react";
import type { ClinicalTrial } from "@/types/clinical-trial";

const MOCK_TRIALS: ClinicalTrial[] = [
  { id: "1", title: "Advanced Immunotherapy Study", phase: "Phase II", status: "Recruiting", condition: "Classical Hodgkin Lymphoma", location: "Mumbai, India", enrollment: 120, startDate: "2026-01-15", description: "A study evaluating advanced immunotherapy approaches for classical Hodgkin Lymphoma patients." },
  { id: "2", title: "Diabetes Treatment Trial", phase: "Phase III", status: "Active", condition: "Type 2 Diabetes", location: "New York, USA", enrollment: 200, startDate: "2023-09-01", description: "Investigating novel treatments for Type 2 Diabetes management." },
  { id: "3", title: "Alzheimer's Disease Study", phase: "Phase II", status: "Completed", condition: "Alzheimer's Disease", location: "Boston, MA", enrollment: 150, startDate: "2024-03-10", description: "Evaluating cognitive improvement therapies for early-stage Alzheimer's." },
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

  return (
    <TrialContext.Provider value={{ trials, addTrial, getTrialById }}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrials() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error("useTrials must be used within TrialProvider");
  return ctx;
}
