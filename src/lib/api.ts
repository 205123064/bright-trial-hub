/**
 * Lightweight API client – wraps fetch with JSON handling, error normalization,
 * and a configurable base URL (VITE_API_BASE_URL).
 *
 * Backend routes consumed today:
 *   GET    /trial                     → list all trials
 *   GET    /trial/:trialId            → single trial
 *   GET    /:trialId                  → patients for a trial (per current backend)
 *   POST   /patients/upload-xml       → multipart upload (xml) → parsed patient + ranking
 *
 * Additional endpoints the frontend can immediately consume once you build them
 * are listed in the README section below the fetch helpers.
 */

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...(init.headers || {}) }
        : init.headers,
      ...init,
    });
  } catch (err) {
    throw new ApiError(
      `Network error – cannot reach ${url}. Is the backend running?`,
      0,
      err,
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "message" in payload &&
        (payload as { message?: string }).message) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message as string, res.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

import type { ClinicalTrial, Patient } from "@/types/clinical-trial";

/** Some backends return { data: ... } or { trial: ... } – normalize. */
function unwrap<T>(payload: unknown, ...keys: string[]): T {
  if (payload && typeof payload === "object") {
    for (const k of keys) {
      if (k in (payload as Record<string, unknown>)) {
        return (payload as Record<string, unknown>)[k] as T;
      }
    }
  }
  return payload as T;
}

/* ── Trial endpoints ── */
export const TrialsAPI = {
  list: async (): Promise<ClinicalTrial[]> => {
    const res = await api.get<unknown>("/trial");
    const arr = unwrap<ClinicalTrial[]>(res, "trials", "data");
    return Array.isArray(arr) ? arr.map(normalizeTrial) : [];
  },

  get: async (id: string): Promise<ClinicalTrial> => {
    const res = await api.get<unknown>(`/trial/${id}`);
    return normalizeTrial(unwrap<ClinicalTrial>(res, "trial", "data"));
  },

  // NOTE: currently expected backend route per user: GET /:trialId for participants.
  patients: async (trialId: string): Promise<Patient[]> => {
    const res = await api.get<unknown>(`/${trialId}`);
    const arr = unwrap<Patient[]>(res, "patients", "participants", "data");
    return Array.isArray(arr) ? arr.map(normalizePatient) : [];
  },

  // ── Endpoints below are NOT YET on the backend – the UI is wired to call
  // them so they "just work" the moment you implement them. ──
  create: (trial: Omit<ClinicalTrial, "id">) =>
    api.post<ClinicalTrial>("/trial", trial).then((r) =>
      normalizeTrial(unwrap<ClinicalTrial>(r, "trial", "data")),
    ),

  update: (id: string, updates: Partial<ClinicalTrial>) =>
    api.put<ClinicalTrial>(`/trial/${id}`, updates).then((r) =>
      normalizeTrial(unwrap<ClinicalTrial>(r, "trial", "data")),
    ),
};

/* ── Patient endpoints ── */
export const PatientsAPI = {
  uploadXml: async (trialId: string, file: File): Promise<Patient> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("trialId", trialId);
    const res = await api.post<unknown>("/patients/upload-xml", fd);
    return normalizePatient(unwrap<Patient>(res, "patient", "data"));
  },
};

/* ── Normalizers: ensure Mongo `_id` becomes `id` and required nested fields exist ── */
function normalizeTrial(t: any): ClinicalTrial {
  if (!t) return t;
  return {
    ...t,
    id: t.id ?? t._id ?? "",
    eligibility: t.eligibility ?? { inclusion: [], exclusion: [] },
    studyPlan: t.studyPlan,
    outcomes: t.outcomes ?? { primary: [], secondary: [] },
    participants: Array.isArray(t.participants)
      ? t.participants.map(normalizePatient)
      : [],
  };
}

function normalizePatient(p: any): Patient {
  if (!p) return p;
  return {
    ...p,
    id: p.id ?? p._id ?? "",
    semanticRepresentations: p.semanticRepresentations ?? [],
    clinicalEntities: p.clinicalEntities ?? [],
    diagnoses: p.diagnoses ?? [],
    performanceStatus: p.performanceStatus ?? { ecog: p.ecog ?? 0 },
    comorbidities: p.comorbidities ?? [],
    labResults: p.labResults ?? [],
    imagingFindings: p.imagingFindings ?? [],
    treatments: p.treatments ?? [],
    eligibilityBreakdown: p.eligibilityBreakdown ?? {
      inclusionSummary: { met: 0, failed: 0, unknown: 0 },
      exclusionSummary: { violated: 0, safe: 0, unknown: 0 },
      inclusionCriteria: [],
      exclusionCriteria: [],
      blockingReasons: [],
      missingInformation: [],
    },
    scoreBreakdown: p.scoreBreakdown ?? {
      eligibilityScore: 0,
      clinicalQualityScore: 0,
      biomarkerFitScore: 0,
      riskPenalty: 0,
      operationalScore: 0,
    },
    lastEvaluated: p.lastEvaluated ?? new Date().toISOString(),
  };
}
