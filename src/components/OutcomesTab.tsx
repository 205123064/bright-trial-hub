import { useState } from "react";
import { Edit2, Save, X, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import type { Outcome, TrialOutcomes } from "@/types/clinical-trial";

const DEFAULT_OUTCOMES: TrialOutcomes = { primary: [], secondary: [] };

interface Props {
  outcomes: TrialOutcomes | undefined;
  onSave: (outcomes: TrialOutcomes) => void;
}

export function OutcomesTab({ outcomes, onSave }: Props) {
  const { toast } = useToast();
  const initial =
  outcomes && typeof outcomes === "object" && "primary" in outcomes
    ? outcomes
    : DEFAULT_OUTCOMES;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [primary, setPrimary] = useState<Outcome[]>(initial.primary.map((o) => ({ ...o })));
  const [secondary, setSecondary] = useState<Outcome[]>(initial.secondary.map((o) => ({ ...o })));
  const [openPrimary, setOpenPrimary] = useState(true);
  const [openSecondary, setOpenSecondary] = useState(true);

  const handleCancel = () => {
    setPrimary(initial.primary.map((o) => ({ ...o })));
    setSecondary(initial.secondary.map((o) => ({ ...o })));
    setEditing(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ primary: primary.filter((o) => o.name.trim()), secondary: secondary.filter((o) => o.name.trim()) });
      toast({ title: "Saved", description: "Outcomes updated." });
      setSaving(false);
      setEditing(false);
    }, 400);
  };

  const addOutcome = (list: Outcome[], setList: (v: Outcome[]) => void) => {
    setList([...list, { id: Date.now().toString(), name: "", description: "", timeFrame: "" }]);
  };

  const updateOutcome = (list: Outcome[], setList: (v: Outcome[]) => void, idx: number, key: keyof Outcome, val: string) => {
    const copy = [...list];
    copy[idx] = { ...copy[idx], [key]: val };
    setList(copy);
  };

  const removeOutcome = (list: Outcome[], setList: (v: Outcome[]) => void, idx: number) => {
    setList(list.filter((_, i) => i !== idx));
  };

  const OutcomeSection = ({ title, items, setItems, open, setOpen }: { title: string; items: Outcome[]; setItems: (v: Outcome[]) => void; open: boolean; setOpen: (v: boolean) => void }) => (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border border-border bg-card p-4 text-left font-semibold text-foreground hover:bg-muted/50 transition-colors">
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {title} ({items.length})
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {items.length === 0 && !editing && <p className="px-4 text-sm text-muted-foreground">No outcomes defined.</p>}
        {items.map((item, idx) => (
          <Card key={item.id} className="animate-fade-in">
            <CardContent className="pt-4 space-y-2">
              {editing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1"><Label className="text-xs">Name</Label><Input value={item.name} onChange={(e) => updateOutcome(items, setItems, idx, "name", e.target.value)} /></div>
                    <Button variant="ghost" size="icon" className="mt-5" onClick={() => removeOutcome(items, setItems, idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Input value={item.description} onChange={(e) => updateOutcome(items, setItems, idx, "description", e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-xs">Time Frame</Label><Input value={item.timeFrame} onChange={(e) => updateOutcome(items, setItems, idx, "timeFrame", e.target.value)} /></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">Time Frame: {item.timeFrame}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {editing && (
          <Button variant="outline" size="sm" onClick={() => addOutcome(items, setItems)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Outcome
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Outcomes</h3>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}><X className="mr-1 h-3.5 w-3.5" /> Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}><Save className="mr-1 h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}</Button>
          </div>
        )}
      </div>
      <OutcomeSection title="Primary Outcomes" items={primary} setItems={setPrimary} open={openPrimary} setOpen={setOpenPrimary} />
      <OutcomeSection title="Secondary Outcomes" items={secondary} setItems={setSecondary} open={openSecondary} setOpen={setOpenSecondary} />
    </div>
  );
}
