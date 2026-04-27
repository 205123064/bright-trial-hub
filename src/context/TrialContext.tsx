import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import type { ClinicalTrial, Patient } from "@/types/clinical-trial";
import { TrialsAPI, ApiError } from "@/lib/api";

interface TrialContextType {
  trials: ClinicalTrial[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;

  addTrial: (trial: Omit<ClinicalTrial, "id">) => Promise<void>;
  updateTrial: (id: string, updates: Partial<ClinicalTrial>) => Promise<void>;

  /** Local cache lookup (no fetch). */
  getTrialById: (id: string) => ClinicalTrial | undefined;
  /** Fetch a single trial fresh from the API and update cache. */
  fetchTrial: (id: string) => Promise<ClinicalTrial | undefined>;
  /** Fetch participants for a trial and merge into cache. */
  fetchPatients: (trialId: string) => Promise<Patient[]>;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<Map<string, Promise<unknown>>>(new Map());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await TrialsAPI.list();
      setTrials(data);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load trials";
      setError(msg);
      // eslint-disable-next-line no-console
      console.error("[TrialContext] refresh failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getTrialById = useCallback(
    (id: string) => trials.find((t) => t.id === id),
    [trials],
  );

  const upsertTrial = useCallback((trial: ClinicalTrial) => {
    setTrials((prev) => {
      const idx = prev.findIndex((t) => t.id === trial.id);
      if (idx === -1) return [trial, ...prev];
      const next = [...prev];
      // Preserve participants if the fresh payload doesn't include them
      next[idx] = {
        ...next[idx],
        ...trial,
        participants: trial.participants?.length
          ? trial.participants
          : next[idx].participants,
      };
      return next;
    });
  }, []);

  const fetchTrial = useCallback(
    async (id: string) => {
      const key = `trial:${id}`;
      if (inflight.current.has(key)) {
        return (await inflight.current.get(key)) as ClinicalTrial | undefined;
      }
      const p = (async () => {
        try {
          const trial = await TrialsAPI.get(id);
          upsertTrial(trial);
          return trial;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`[TrialContext] fetchTrial(${id}) failed:`, e);
          return undefined;
        } finally {
          inflight.current.delete(key);
        }
      })();
      inflight.current.set(key, p);
      return p;
    },
    [upsertTrial],
  );

  const fetchPatients = useCallback(
    async (trialId: string) => {
      const key = `patients:${trialId}`;
      if (inflight.current.has(key)) {
        return (await inflight.current.get(key)) as Patient[];
      }
      const p = (async () => {
        try {
          const patients = await TrialsAPI.patients(trialId);
          setTrials((prev) =>
            prev.map((t) =>
              t.id === trialId ? { ...t, participants: patients } : t,
            ),
          );
          return patients;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(
            `[TrialContext] fetchPatients(${trialId}) failed:`,
            e,
          );
          return [];
        } finally {
          inflight.current.delete(key);
        }
      })();
      inflight.current.set(key, p);
      return p;
    },
    [],
  );

  const addTrial = useCallback(
    async (trial: Omit<ClinicalTrial, "id">) => {
      try {
        const created = await TrialsAPI.create(trial);
        setTrials((prev) => [created, ...prev]);
      } catch (e) {
        // Fallback so the UI doesn't break before the POST endpoint exists
        // eslint-disable-next-line no-console
        console.warn(
          "[TrialContext] POST /trial failed – inserting locally only:",
          e,
        );
        const local: ClinicalTrial = { ...trial, id: Date.now().toString() };
        setTrials((prev) => [local, ...prev]);
      }
    },
    [],
  );

  const updateTrial = useCallback(
    async (id: string, updates: Partial<ClinicalTrial>) => {
      // Optimistic update
      setTrials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
      try {
        await TrialsAPI.update(id, updates);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
          `[TrialContext] PUT /trial/${id} failed – kept local change only:`,
          e,
        );
      }
    },
    [],
  );

  return (
    <TrialContext.Provider
      value={{
        trials,
        loading,
        error,
        refresh,
        addTrial,
        updateTrial,
        getTrialById,
        fetchTrial,
        fetchPatients,
      }}
    >
      {children}
    </TrialContext.Provider>
  );
}

export function useTrials() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error("useTrials must be used within TrialProvider");
  return ctx;
}
