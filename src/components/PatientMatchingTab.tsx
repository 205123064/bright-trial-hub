import React, { useMemo, useState } from "react";
import {
  Search, SlidersHorizontal, Trophy, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, HelpCircle, XCircle, Shield, Eye,
  Activity, FlaskConical, Scan, Pill, FileText, Clock,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { cn } from "@/lib/utils";
import type { Patient, ClinicalTrial, EligibilityStatus, CriterionResult } from "@/types/clinical-trial";

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

function DecisionBadge({ decision }: { decision: string }) {
  if (decision === "Yes") return <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/20" variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Met</Badge>;
  if (decision === "No") return <Badge className="bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20" variant="outline"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
  return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/20" variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
}

function ExcDecisionBadge({ decision }: { decision: string }) {
  // For exclusion: "Yes" means violated (bad), "No" means safe (good)
  if (decision === "Yes") return <Badge className="bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30 hover:bg-[hsl(var(--destructive))]/20" variant="outline"><XCircle className="mr-1 h-3 w-3" />Violated</Badge>;
  if (decision === "No") return <Badge className="bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30 hover:bg-[hsl(var(--success))]/20" variant="outline"><CheckCircle2 className="mr-1 h-3 w-3" />Safe</Badge>;
  return <Badge className="bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30 hover:bg-[hsl(var(--warning))]/20" variant="outline"><HelpCircle className="mr-1 h-3 w-3" />Unknown</Badge>;
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
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary">
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

/* ── Criteria Row ── */
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

/* ── Expanded Patient Row ── */
function ExpandedPatientView({ patient }: { patient: Patient }) {
  const eb = patient.eligibilityBreakdown;
  return (
    <div className="animate-fade-in space-y-5 p-4 bg-muted/20">
      {/* Section A: Clinical Summary */}
      <Card className="shadow-none border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" /> Clinical Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Diagnoses</p>
              <div className="mt-1 space-y-1">
                {patient.diagnoses.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className={cn("h-1.5 w-1.5 rounded-full", d.active ? "bg-[hsl(var(--destructive))]" : "bg-muted-foreground")} />
                    <span className="font-medium text-foreground">{d.name}</span>
                    {d.stage && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{d.stage}</Badge>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Performance Status</p>
              <div className="mt-1 text-sm">
                <p className="text-foreground">ECOG: <span className="font-semibold">{patient.performanceStatus.ecog}</span></p>
                {patient.performanceStatus.karnofsky != null && <p className="text-foreground">Karnofsky: <span className="font-semibold">{patient.performanceStatus.karnofsky}%</span></p>}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comorbidities</p>
              <div className="mt-1">
                {patient.comorbidities.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.comorbidities.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">None</p>}
              </div>
            </div>
          </div>
          {/* Key symptoms from clinical entities */}
          {patient.clinicalEntities.filter(e => e.entityType === "Symptom").length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Key Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {patient.clinicalEntities.filter(e => e.entityType === "Symptom").map((e, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-xs">
                    {e.name} <span className="text-muted-foreground">({e.severity}, {e.duration})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section B: Lab Results */}
      {patient.labResults.length > 0 && (
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FlaskConical className="h-4 w-4 text-primary" /> Lab Results
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs h-8">Test</TableHead>
                    <TableHead className="text-xs h-8">Value</TableHead>
                    <TableHead className="text-xs h-8">Unit</TableHead>
                    <TableHead className="text-xs h-8">Status</TableHead>
                    <TableHead className="text-xs h-8">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.labResults.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-1.5 text-xs font-medium">{l.test}</TableCell>
                      <TableCell className={cn("py-1.5 text-xs font-semibold", l.abnormal && "text-[hsl(var(--destructive))]")}>{l.value}</TableCell>
                      <TableCell className="py-1.5 text-xs text-muted-foreground">{l.unit}</TableCell>
                      <TableCell className="py-1.5 text-xs">
                        {l.abnormal ? (
                          <span className="inline-flex items-center gap-1 text-[hsl(var(--destructive))]"><AlertTriangle className="h-3 w-3" /> Abnormal</span>
                        ) : (
                          <span className="text-muted-foreground">Normal</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-xs text-muted-foreground">{l.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section C: Imaging Findings */}
      {patient.imagingFindings.length > 0 && (
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Scan className="h-4 w-4 text-primary" /> Imaging Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {patient.imagingFindings.map((img, i) => (
                <div key={i} className="rounded-md border border-border bg-card p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{img.modality}</Badge>
                    <span className="text-xs text-muted-foreground">{img.date}</span>
                  </div>
                  <p className="text-sm text-foreground">{img.finding}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section D: Treatment History */}
      {patient.treatments.length > 0 && (
        <Card className="shadow-none border-border">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Pill className="h-4 w-4 text-primary" /> Treatment History
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="relative space-y-3 pl-6 before:absolute before:left-2 before:top-1 before:h-[calc(100%-8px)] before:w-px before:bg-border">
              {patient.treatments.map((t, i) => {
                const responseColor: Record<string, string> = { CR: "text-[hsl(var(--success))]", PR: "text-[hsl(var(--info))]", SD: "text-[hsl(var(--warning))]", PD: "text-[hsl(var(--destructive))]", Unknown: "text-muted-foreground" };
                return (
                  <div key={i} className="relative">
                    <div className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />
                    <div className="rounded-md border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{t.drug}</span>
                        <Badge variant="outline" className="text-xs">Line {t.line}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t.startDate} → {t.endDate || "Ongoing"}</span>
                        <span className={cn("font-semibold", responseColor[t.response] || "text-muted-foreground")}>
                          Response: {t.response}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section E: Eligibility Breakdown */}
      <Card className="shadow-none border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" /> Eligibility Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-4">
          {/* Summaries */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Inclusion Summary</p>
              <div className="flex gap-3 text-xs">
                <span className="text-[hsl(var(--success))]">✓ Met: {eb.inclusionSummary.met}</span>
                <span className="text-[hsl(var(--destructive))]">✗ Failed: {eb.inclusionSummary.failed}</span>
                <span className="text-[hsl(var(--warning))]">? Unknown: {eb.inclusionSummary.unknown}</span>
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-foreground mb-2">Exclusion Summary</p>
              <div className="flex gap-3 text-xs">
                <span className="text-[hsl(var(--destructive))]">⚠ Violated: {eb.exclusionSummary.violated}</span>
                <span className="text-[hsl(var(--success))]">✓ Safe: {eb.exclusionSummary.safe}</span>
                <span className="text-[hsl(var(--warning))]">? Unknown: {eb.exclusionSummary.unknown}</span>
              </div>
            </div>
          </div>

          {/* Blocking Reasons */}
          {eb.blockingReasons.length > 0 && (
            <div className="rounded-md border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-3">
              <p className="text-xs font-semibold text-[hsl(var(--destructive))] mb-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Blocking Reasons</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-foreground">
                {eb.blockingReasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Missing Information */}
          {eb.missingInformation.length > 0 && (
            <div className="rounded-md border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 p-3">
              <p className="text-xs font-semibold text-[hsl(var(--warning))] mb-1 flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> Missing Information</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-foreground">
                {eb.missingInformation.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          {/* Criteria Details */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Inclusion Criteria</p>
            <div className="space-y-1.5">
              {eb.inclusionCriteria.map((c, i) => <CriteriaRow key={i} c={c} />)}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Exclusion Criteria</p>
            <div className="space-y-1.5">
              {eb.exclusionCriteria.map((c, i) => <CriteriaRow key={i} c={c} isExclusion />)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Main Component ── */

export function PatientMatchingTab({ trial }: Props) {
  const participants = trial.participants || [];
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [eligibilityFilter, setEligibilityFilter] = useState("");
  const [showInclusionFailures, setShowInclusionFailures] = useState(false);
  const [showMissingData, setShowMissingData] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  // Metrics
  const totalScreened = participants.length;
  const eligibleCount = participants.filter(p => p.eligibilityStatus === "Eligible").length;
  const avgScore = totalScreened > 0 ? Math.round(participants.reduce((s, p) => s + p.rankingScore, 0) / totalScreened) : 0;
  const lastEval = participants.length > 0
    ? new Date(Math.max(...participants.map(p => new Date(p.lastEvaluated).getTime()))).toLocaleString()
    : "—";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Patient Matching</h3>
      </div>

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

      {/* Unified Table */}
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
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const isExpanded = expandedId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer border-l-4 transition-colors hover:bg-muted/50",
                        getScoreBorderL(p.rankingScore),
                        isTop3 && "bg-primary/[0.03]",
                        isExpanded && "bg-muted/30"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
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
                      <TableCell>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={10} className="p-0">
                          <ExpandedPatientView patient={p} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
