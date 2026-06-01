import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ClinicalTrial, TrialPhase, TrialStatus } from "@/types/clinical-trial";

interface Props {
  trial: ClinicalTrial;
  onSave: (updates: Partial<ClinicalTrial>) => void;
}

export function OverviewTab({ trial, onSave }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: trial.title,
    phase: trial.phase,
    status: trial.status,
    condition: trial.condition,
    location: trial.location,
    enrollment: trial.enrollment,
    startDate: trial.startDate,
    description: trial.description || "",
    agesEligible: trial.agesEligible || "",
    sexesEligible: trial.sexesEligible || "",
    acceptsHealthyVolunteers: trial.acceptsHealthyVolunteers ?? false,
  });

  const handleCancel = () => {
    setForm({
      title: trial.title, phase: trial.phase, status: trial.status, condition: trial.condition,
      location: trial.location, enrollment: trial.enrollment, startDate: trial.startDate,
      description: trial.description || "", agesEligible: trial.agesEligible || "",
      sexesEligible: trial.sexesEligible || "", acceptsHealthyVolunteers: trial.acceptsHealthyVolunteers ?? false,
    });
    setEditing(false);
  };
  const formattedStartDate = trial.startDate
  ? new Date(trial.startDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  : "—";

  const handleSave = () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form, enrollment: Number(form.enrollment) });
      toast({ title: "Saved", description: "Trial overview updated successfully." });
      setSaving(false);
      setEditing(false);
    }, 400);
  };

  const f = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Trial Overview</h3>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}><X className="mr-1 h-3.5 w-3.5" /> Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-1 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {!editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Row label="Trial Title" value={trial.title} />
              <Row label="Phase" value={trial.phase} />
              <Row label="Status" value={trial.status} />
              <Row label="Condition" value={trial.condition} />
              <Row label="Location" value={trial.location} />
              <Row label="Enrollment Target" value={trial.enrollment} />
              <Row label="Start Date" value={formattedStartDate} />
              <Row label="Ages Eligible" value={trial.agesEligible} />
              <Row label="Sexes Eligible" value={trial.sexesEligible} />
              <Row label="Accepts Healthy Volunteers" value={trial.acceptsHealthyVolunteers ? "Yes" : "No"} />
              {trial.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="text-sm leading-relaxed text-foreground">{trial.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Trial Title</Label>
                <Input value={form.title} onChange={(e) => f("title", e.target.value)} maxLength={200} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Phase</Label>
                  <Select value={form.phase} onValueChange={(v) => f("phase", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Phase I", "Phase II", "Phase III", "Phase IV"] as TrialPhase[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => f("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["Recruiting", "Active", "Completed", "Closed"] as TrialStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Condition</Label><Input value={form.condition} onChange={(e) => f("condition", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => f("location", e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Enrollment Target</Label><Input type="number" min={1} value={form.enrollment} onChange={(e) => f("enrollment", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => f("startDate", e.target.value)} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Ages Eligible</Label><Input value={form.agesEligible} onChange={(e) => f("agesEligible", e.target.value)} placeholder="e.g. 18-65 years" /></div>
                <div className="space-y-1.5"><Label>Sexes Eligible</Label><Input value={form.sexesEligible} onChange={(e) => f("sexesEligible", e.target.value)} placeholder="e.g. All" /></div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.acceptsHealthyVolunteers} onCheckedChange={(v) => f("acceptsHealthyVolunteers", v)} />
                <Label>Accepts Healthy Volunteers</Label>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => f("description", e.target.value)} rows={4} maxLength={1000} /></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
