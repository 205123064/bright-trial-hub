import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Activity, FlaskConical, Scan, Pill, FileText, Shield,
  AlertTriangle, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronRight, Eye, Clock, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { cn } from "@/lib/utils";
import { useTrials } from "@/context/TrialContext";
import type { Patient, CriterionResult } from "@/types/clinical-trial";

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

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Moderate";
  return "Low";
}

function eligibilityBadge(status: string) {
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    Eligible: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/30" },
    "Not Eligible": { icon: <XCircle className="h-3.5 w-3.5" />, cls: "bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30" },
    Uncertain: { icon: <HelpCircle className="h-3.5 w-3.5" />, cls: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30" },
  };
  const m = map[status] || map.Uncertain;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium", m.cls)}>
      {m.icon} {status}
    </span>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "Yes") return <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/20" variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Met</Badge>;
  if (decision === "No") return <Badge className="bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20" variant="outline"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
  return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/20" variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
}

function ExcDecisionBadge({ decision }: { decision: string }) {
  if (decision === "Yes") return <Badge className="bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20" variant="outline"><XCircle className="mr-1 h-3 w-3" />Violated</Badge>;
  if (decision === "No") return <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/20" variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Safe</Badge>;
  return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/20" variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
}

function CriteriaRow({ c, isExclusion }: { c: CriterionResult; isExclusion?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2 text-left">
        <div className="flex items-center gap-2 text-sm">
          {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className="text-foreground">{c.criterion}</span>
        </div>
        {isExclusion ? <ExcDecisionBadge decision={c.decision} /> : <DecisionBadge decision={c.decision} />}
      </button>
      {open && (
        <div className="border-t border-border px-3 py-2 space-y-1 text-xs text-muted-foreground bg-muted/30">
          <p><span className="font-medium text-foreground">Justification:</span> {c.justification}</p>
          <p><span className="font-medium text-foreground">Evidence:</span> {c.evidence}</p>
          <p><span className="font-medium text-foreground">Evaluated:</span> {new Date(c.timestamp).toLocaleString()}</p>
          <p><span className="font-medium text-foreground">Model:</span> {c.modelVersion}</p>
        </div>
      )}
    </div>
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
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" /> View Score Breakdown
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

/* ── Main Page ── */

export default function PatientDetail() {
  const { id: trialId, patientId } = useParams<{ id: string; patientId: string }>();
  const navigate = useNavigate();
  const { getTrialById, fetchTrial, fetchPatients } = useTrials();
  const trial = trialId ? getTrialById(trialId) : undefined;
  const patient = trial?.participants?.find((p) => p.id === patientId);
  const [bootstrapping, setBootstrapping] = useState(!patient);

  // Ensure trial + patients are loaded if user landed here directly
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trialId) return;
      if (!trial) await fetchTrial(trialId);
      if (!trial?.participants?.length) await fetchPatients(trialId);
      if (!cancelled) setBootstrapping(false);
    })();
    return () => { cancelled = true; };
  }, [trialId, trial, fetchTrial, fetchPatients]);

  if (bootstrapping) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  if (!trial || !patient) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">Patient not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(trialId ? `/trial/${trialId}` : "/")}>
          Back to Trial
        </Button>
      </div>
    );
  }

  const eb = patient.eligibilityBreakdown;
  const responseColor: Record<string, string> = {
    CR: "text-[hsl(var(--success))]",
    PR: "text-[hsl(var(--info))]",
    SD: "text-[hsl(var(--warning))]",
    PD: "text-[hsl(var(--destructive))]",
    Unknown: "text-muted-foreground",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b border-border lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/trial/${trialId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Patient {patient.id}</h1>
              <p className="text-sm text-muted-foreground">{patient.primaryDiagnosis} · Age {patient.age} · {patient.sex}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Topic: {patient.topicId}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Match Score */}
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-bold", getScoreColor(patient.rankingScore))}>{patient.rankingScore}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold text-white", getScoreBg(patient.rankingScore))}>
                {getScoreLabel(patient.rankingScore)}
              </span>
            </div>
            {eligibilityBadge(patient.eligibilityStatus)}
            {patient.riskFlag && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/10 px-2.5 py-1 text-xs font-medium text-[hsl(var(--destructive))]">
                <AlertTriangle className="h-3.5 w-3.5" /> Risk
              </span>
            )}
            <ScoreBreakdownDialog patient={patient} />
          </div>
        </div>
      </div>

      {/* Section 1: Clinical Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" /> Clinical Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Diagnoses */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Diagnoses</p>
              <div className="space-y-1.5">
                {patient.diagnoses.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={cn("h-2 w-2 rounded-full", d.active ? "bg-[hsl(var(--destructive))]" : "bg-muted-foreground")} />
                    <span className="font-medium text-foreground">{d.name}</span>
                    {d.stage && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{d.stage}</Badge>}
                    <Badge variant={d.active ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                      {d.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Performance Status */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Performance Status</p>
              <div className="text-sm space-y-1">
                <p className="text-foreground">ECOG: <span className={cn("font-bold", patient.ecog >= 3 ? "text-[hsl(var(--destructive))]" : "text-foreground")}>{patient.performanceStatus.ecog}</span></p>
                {patient.performanceStatus.karnofsky != null && (
                  <p className="text-foreground">Karnofsky: <span className="font-bold">{patient.performanceStatus.karnofsky}%</span></p>
                )}
              </div>
            </div>
            {/* Comorbidities */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Comorbidities</p>
              {patient.comorbidities.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.comorbidities.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">None reported</p>}
            </div>
          </div>
          {/* Symptoms */}
          {patient.clinicalEntities.filter(e => e.entityType === "Symptom").length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Key Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {patient.clinicalEntities.filter(e => e.entityType === "Symptom").map((e, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs">
                    {e.name} <span className="text-muted-foreground">· {e.severity} · {e.duration}</span>
                    {e.temporalContext && <span className="text-muted-foreground">· {e.temporalContext}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Lab Results */}
      {patient.labResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" /> Lab Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs h-9">Test</TableHead>
                    <TableHead className="text-xs h-9">Value</TableHead>
                    <TableHead className="text-xs h-9">Unit</TableHead>
                    <TableHead className="text-xs h-9">Status</TableHead>
                    <TableHead className="text-xs h-9">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...patient.labResults].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2 text-sm font-medium">{l.test}</TableCell>
                      <TableCell className={cn("py-2 text-sm font-semibold", l.abnormal && "text-[hsl(var(--destructive))]")}>{l.value}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{l.unit}</TableCell>
                      <TableCell className="py-2 text-sm">
                        {l.abnormal ? (
                          <span className="inline-flex items-center gap-1 text-[hsl(var(--destructive))]"><AlertTriangle className="h-3.5 w-3.5" /> Abnormal</span>
                        ) : (
                          <span className="text-muted-foreground">Normal</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{l.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Imaging Findings */}
      {patient.imagingFindings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Scan className="h-4 w-4 text-primary" /> Imaging Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {patient.imagingFindings.map((img, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{img.modality}</Badge>
                    <span className="text-xs text-muted-foreground">{img.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{img.finding}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Treatment History */}
      {patient.treatments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" /> Treatment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-3 pl-6 before:absolute before:left-2 before:top-1 before:h-[calc(100%-8px)] before:w-px before:bg-border">
              {patient.treatments.map((t, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[18px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-card" />
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{t.drug}</span>
                      <Badge variant="outline" className="text-xs">Line {t.line}</Badge>
                    </div>
                    <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.startDate} → {t.endDate || "Ongoing"}</span>
                      <span className={cn("font-semibold", responseColor[t.response] || "text-muted-foreground")}>
                        Response: {t.response}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 5: Eligibility Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Eligibility Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summaries */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground mb-2">Inclusion Summary</p>
              <div className="flex gap-4 text-sm">
                <span className="text-[hsl(var(--success))]">✓ Met: {eb.inclusionSummary.met}</span>
                <span className="text-[hsl(var(--destructive))]">✗ Failed: {eb.inclusionSummary.failed}</span>
                <span className="text-[hsl(var(--warning))]">? Unknown: {eb.inclusionSummary.unknown}</span>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold text-foreground mb-2">Exclusion Summary</p>
              <div className="flex gap-4 text-sm">
                <span className="text-[hsl(var(--destructive))]">⚠ Violated: {eb.exclusionSummary.violated}</span>
                <span className="text-[hsl(var(--success))]">✓ Safe: {eb.exclusionSummary.safe}</span>
                <span className="text-[hsl(var(--warning))]">? Unknown: {eb.exclusionSummary.unknown}</span>
              </div>
            </div>
          </div>

          {/* Blocking Reasons */}
          {eb.blockingReasons.length > 0 && (
            <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4">
              <p className="text-sm font-semibold text-[hsl(var(--destructive))] mb-1.5 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Blocking Reasons</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm text-foreground">
                {eb.blockingReasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Missing Information */}
          {eb.missingInformation.length > 0 && (
            <div className="rounded-lg border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-4">
              <p className="text-sm font-semibold text-[hsl(var(--warning))] mb-1.5 flex items-center gap-1"><HelpCircle className="h-4 w-4" /> Missing Information</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm text-foreground">
                {eb.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          {/* Inclusion Criteria */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Inclusion Criteria</p>
            <div className="space-y-1.5">
              {eb.inclusionCriteria.map((c, i) => <CriteriaRow key={i} c={c} />)}
            </div>
          </div>

          {/* Exclusion Criteria */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Exclusion Criteria</p>
            <div className="space-y-1.5">
              {eb.exclusionCriteria.map((c, i) => <CriteriaRow key={i} c={c} isExclusion />)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
