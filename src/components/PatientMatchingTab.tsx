import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, SlidersHorizontal, Trophy, Upload,
  AlertTriangle, CheckCircle2, HelpCircle, XCircle, Shield, Eye,
  Activity, Clock, FileText, Plus, Loader2, RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { cn } from "@/lib/utils";
import { useTrials } from "@/context/TrialContext";
import { PatientsAPI, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Patient, ClinicalTrial, EligibilityStatus } from "@/types/clinical-trial";

interface Props {
  trial: ClinicalTrial;
}

/* ── Helpers ── */

function getScoreColor(score: number) {
  if (score >= 85) return "text-[hsl(var(--success))]";
  if (score >= 70) return "text-[hsl(var(--warning))]";
  return "text-[hsl(var(--destructive))]";
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-[hsl(var(--success))]";
  if (score >= 70) return "bg-[hsl(var(--warning))]";
  return "bg-[hsl(var(--destructive))]";
}

function getScoreBorderL(score: number) {
  if (score >= 85) return "border-l-[hsl(var(--success))]";
  if (score >= 70) return "border-l-[hsl(var(--warning))]";
  return "border-l-[hsl(var(--destructive))]";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Moderate";
  return "Low";
}

function statusBadge(status: EligibilityStatus) {
  const map: Record<EligibilityStatus, { icon: React.ReactNode; cls: string }> = {
    Eligible: { icon: <CheckCircle2 className="h-3 w-3" />, cls: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30" },
    "Not Eligible": { icon: <XCircle className="h-3 w-3" />, cls: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30" },
    Uncertain: { icon: <HelpCircle className="h-3 w-3" />, cls: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30" },
  };
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", m.cls)}>
      {m.icon} {status}
    </span>
  );
}

/* ── Score Breakdown Dialog ── */
function ScoreBreakdownDialog({ patient }: { patient: Patient }) {
  const sb = patient.scoreBreakdown;
  const items = [
    { label: "Eligibility Score", value: sb.eligibilityScore, desc: "How well inclusion/exclusion criteria are met" },
    { label: "Clinical Quality Score", value: sb.clinicalQualityScore, desc: "Quality and completeness of clinical data" },
    { label: "Biomarker Fit Score", value: sb.biomarkerFitScore, desc: "Biomarker alignment with trial requirements" },
    { label: "Risk Penalty", value: sb.riskPenalty, desc: "Deductions for comorbidities, organ function, etc.", isNegative: true },
    { label: "Operational Score", value: sb.operationalScore, desc: "Site proximity, compliance likelihood" },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary" onClick={(e) => e.stopPropagation()}>
          <Eye className="h-3 w-3" /> View Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Score Breakdown – {patient.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Final Match Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(patient.rankingScore))}>{patient.rankingScore}</span>
          </div>
          <Separator />
          {items.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={cn("text-sm font-semibold", item.isNegative ? "text-[hsl(var(--destructive))]" : getScoreColor(item.value))}>
                  {item.isNegative ? `-${item.value}` : item.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
              {!item.isNegative && <ScoreProgressBar score={item.value} />}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Upload XML Modal ── */
function UploadXmlDialog({ trialId, onUploaded }: { trialId: string; onUploaded: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const { toast } = useToast();

  const reset = () => {
    setFile(null);
    setError("");
    setStatus("idle");
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setStatus("idle");
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".xml")) {
      setError("Only .xml files are accepted.");
      setFile(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      await PatientsAPI.uploadXml(trialId, file);
      setStatus("success");
      toast({ title: "Patient added", description: "XML parsed and ranking updated." });
      onUploaded();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Upload failed";
      setStatus("error");
      setError(msg);
      // eslint-disable-next-line no-console
      console.error("Upload XML failed:", e);
    }
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Participant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" /> Upload Patient XML
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">Upload a patient XML file to parse, evaluate eligibility, and add to this trial.</p>

          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors",
              error ? "border-[hsl(var(--destructive))]/50 bg-[hsl(var(--destructive))]/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
            )}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{file ? file.name : "Click to select an XML file"}</p>
            <p className="text-xs text-muted-foreground">Accepts .xml only · Max 10 MB</p>
          </div>

          <input ref={fileRef} type="file" accept=".xml" className="hidden" onChange={handleSelect} />

          {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}

          {status === "processing" && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Processing...
            </div>
          )}
          {status === "success" && (
            <p className="flex items-center gap-1.5 text-sm text-[hsl(var(--success))]">
              <CheckCircle2 className="h-4 w-4" /> Patient added successfully.
            </p>
          )}

          <Button onClick={handleUpload} disabled={!file || status === "processing" || status === "success"} className="w-full">
            Upload & Evaluate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main Component ── */

export function PatientMatchingTab({ trial }: Props) {
  const navigate = useNavigate();
  const { fetchPatients } = useTrials();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const participants = trial.participants || [];

  const loadPatients = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await fetchPatients(trial.id);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, [trial.id, fetchPatients]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [eligibilityFilter, setEligibilityFilter] = useState("");
  const [showInclusionFailures, setShowInclusionFailures] = useState(false);
  const [showMissingData, setShowMissingData] = useState(false);

  const sorted = useMemo(() => {
    let result = [...participants];
    const q = search.toLowerCase();
    if (q) result = result.filter((p) => p.id.toLowerCase().includes(q));
    if (sexFilter && sexFilter !== "all") result = result.filter((p) => p.sex === sexFilter);
    if (ageMin) result = result.filter((p) => p.age >= Number(ageMin));
    if (ageMax) result = result.filter((p) => p.age <= Number(ageMax));
    if (minScore > 0) result = result.filter((p) => p.rankingScore >= minScore);
    if (eligibilityFilter && eligibilityFilter !== "all") result = result.filter((p) => p.eligibilityStatus === eligibilityFilter);
    if (showInclusionFailures) result = result.filter((p) => p.eligibilityBreakdown.inclusionSummary.failed > 0);
    if (showMissingData) result = result.filter((p) => p.eligibilityBreakdown.missingInformation.length > 0);
    return result.sort((a, b) => b.rankingScore - a.rankingScore);
  }, [participants, search, sexFilter, ageMin, ageMax, minScore, eligibilityFilter, showInclusionFailures, showMissingData]);

  const totalScreened = participants.length;
  const eligibleCount = participants.filter(p => p.eligibilityStatus === "Eligible").length;
  const avgScore = totalScreened > 0 ? Math.round(participants.reduce((s, p) => s + p.rankingScore, 0) / totalScreened) : 0;
  const lastEval = participants.length > 0
    ? new Date(Math.max(...participants.map(p => new Date(p.lastEvaluated).getTime()))).toLocaleString()
    : "—";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Patient Matching</h3>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadPatients} className="gap-1.5" disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
          </Button>
          <UploadXmlDialog trialId={trial.id} onUploaded={loadPatients} />
        </div>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" /> {loadError}
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Total Screened</p>
          <p className="text-xl font-bold text-foreground">{totalScreened}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Eligible</p>
          <p className="text-xl font-bold text-[hsl(var(--success))]">{eligibleCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Avg Match Score</p>
          <p className={cn("text-xl font-bold", getScoreColor(avgScore))}>{avgScore}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Last Evaluation</p>
          <p className="text-sm font-medium text-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{lastEval}</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by Patient ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sexFilter} onValueChange={setSexFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sex" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sexes</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Age min" className="w-[100px]" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
          <Input type="number" placeholder="Age max" className="w-[100px]" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
          <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Eligibility" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Eligible">Eligible</SelectItem>
              <SelectItem value="Not Eligible">Not Eligible</SelectItem>
              <SelectItem value="Uncertain">Uncertain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Min Score: {minScore}</span>
            <Slider value={[minScore]} onValueChange={([v]) => setMinScore(v)} max={100} step={1} className="w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="incl-fail" checked={showInclusionFailures} onCheckedChange={setShowInclusionFailures} />
            <Label htmlFor="incl-fail" className="text-sm text-muted-foreground cursor-pointer">Inclusion Failures</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="missing" checked={showMissingData} onCheckedChange={setShowMissingData} />
            <Label htmlFor="missing" className="text-sm text-muted-foreground cursor-pointer">Missing Data</Label>
          </div>
        </div>
      </div>

      {/* Unified Table – Clean, no accordion */}
      {sorted.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Primary Diagnosis</TableHead>
                <TableHead>ECOG</TableHead>
                <TableHead className="min-w-[180px]">Match Score</TableHead>
                <TableHead>Eligibility</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;

                return (
                  <TableRow
                    key={p.id}
                    className={cn(
                      "border-l-4 transition-colors hover:bg-muted/50",
                      getScoreBorderL(p.rankingScore),
                      isTop3 && "bg-primary/[0.03]",
                    )}
                  >
                    <TableCell className="font-bold">
                      {isTop3 ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {rank}
                        </span>
                      ) : rank}
                    </TableCell>
                    <TableCell className="font-medium">{p.id}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.sex}</TableCell>
                    <TableCell className="text-sm">{p.primaryDiagnosis}</TableCell>
                    <TableCell>
                      <span className={cn("font-semibold", p.ecog >= 3 ? "text-[hsl(var(--destructive))]" : "text-foreground")}>{p.ecog}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", getScoreColor(p.rankingScore))}>{p.rankingScore}</span>
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white", getScoreBg(p.rankingScore))}>
                            {getScoreLabel(p.rankingScore)}
                          </span>
                        </div>
                        <ScoreProgressBar score={p.rankingScore} />
                        <ScoreBreakdownDialog patient={p} />
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(p.eligibilityStatus)}</TableCell>
                    <TableCell>
                      {p.riskFlag ? (
                        <AlertTriangle className="h-4 w-4 text-[hsl(var(--destructive))]" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => navigate(`/trial/${trial.id}/patient/${p.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
          <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No patients match the current filters.</p>
        </div>
      )}

      {/* Future-Ready Placeholders */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button variant="outline" size="sm" disabled className="text-xs gap-1.5 opacity-60">
          <Activity className="h-3.5 w-3.5" /> Auto Re-evaluate
        </Button>
        <Button variant="outline" size="sm" disabled className="text-xs gap-1.5 opacity-60">
          <Shield className="h-3.5 w-3.5" /> Model Comparison
        </Button>
        <Button variant="outline" size="sm" disabled className="text-xs gap-1.5 opacity-60">
          <Clock className="h-3.5 w-3.5" /> Audit Log
        </Button>
        <Button variant="outline" size="sm" disabled className="text-xs gap-1.5 opacity-60">
          <FileText className="h-3.5 w-3.5" /> Download Report (PDF)
        </Button>
      </div>
    </div>
  );
}
