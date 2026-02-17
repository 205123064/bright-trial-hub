import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { StudyPlan } from "@/types/clinical-trial";

const DEFAULT: StudyPlan = { primaryPurpose: "", allocation: "", interventionalModel: "", masking: "", interventionDescription: "", arms: "", interventionType: "", otherNames: "" };

interface Props {
  studyPlan: StudyPlan | undefined;
  onSave: (plan: StudyPlan) => void;
}

export function StudyPlanTab({ studyPlan, onSave }: Props) {
  const { toast } = useToast();
  const initial = studyPlan || DEFAULT;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...initial });

  const handleCancel = () => { setForm({ ...initial }); setEditing(false); };
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(form);
      toast({ title: "Saved", description: "Study plan updated." });
      setSaving(false);
      setEditing(false);
    }, 400);
  };

  const f = (key: keyof StudyPlan, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const fields: { key: keyof StudyPlan; label: string; textarea?: boolean }[] = [
    { key: "primaryPurpose", label: "Primary Purpose" },
    { key: "allocation", label: "Allocation" },
    { key: "interventionalModel", label: "Interventional Model" },
    { key: "masking", label: "Masking" },
    { key: "interventionDescription", label: "Intervention Description", textarea: true },
    { key: "arms", label: "Arms" },
    { key: "interventionType", label: "Intervention Type" },
    { key: "otherNames", label: "Other Names" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Study Plan</h3>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}><X className="mr-1 h-3.5 w-3.5" /> Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-1 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          {!editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ key, label }) => (
                <div key={key} className={key === "interventionDescription" ? "sm:col-span-2" : ""}>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{form[key] || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map(({ key, label, textarea }) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  {textarea ? (
                    <Textarea value={form[key]} onChange={(e) => f(key, e.target.value)} rows={3} />
                  ) : (
                    <Input value={form[key]} onChange={(e) => f(key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
