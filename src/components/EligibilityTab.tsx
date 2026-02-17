import { useState } from "react";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { EligibilityCriteria } from "@/types/clinical-trial";

interface Props {
  eligibility: EligibilityCriteria;
  onSave: (eligibility: EligibilityCriteria) => void;
}

export function EligibilityTab({ eligibility, onSave }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inclusion, setInclusion] = useState([...eligibility.inclusion]);
  const [exclusion, setExclusion] = useState([...eligibility.exclusion]);

  const handleCancel = () => {
    setInclusion([...eligibility.inclusion]);
    setExclusion([...eligibility.exclusion]);
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const cleaned = { inclusion: inclusion.filter((s) => s.trim()), exclusion: exclusion.filter((s) => s.trim()) };
      onSave(cleaned);
      toast({ title: "Saved", description: "Eligibility criteria updated." });
      setSaving(false);
      setEditing(false);
    }, 400);
  };

  const updateItem = (list: string[], setList: (v: string[]) => void, idx: number, val: string) => {
    const copy = [...list];
    copy[idx] = val;
    setList(copy);
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const CriteriaSection = ({ title, items, setItems, color }: { title: string; items: string[]; setItems: (v: string[]) => void; color: string }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 && !editing && <p className="text-sm text-muted-foreground">No criteria defined.</p>}
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
              {editing ? (
                <div className="flex flex-1 gap-2">
                  <Input value={item} onChange={(e) => updateItem(items, setItems, idx, e.target.value)} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(items, setItems, idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ) : (
                <span className="text-sm text-foreground">{item}</span>
              )}
            </li>
          ))}
        </ul>
        {editing && (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setItems([...items, ""])}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Criterion
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Eligibility Criteria</h3>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}><X className="mr-1 h-3.5 w-3.5" /> Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-1 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      <CriteriaSection title="Inclusion Criteria" items={inclusion} setItems={setInclusion} color="bg-green-500" />
      <CriteriaSection title="Exclusion Criteria" items={exclusion} setItems={setExclusion} color="bg-red-500" />
    </div>
  );
}
