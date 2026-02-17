import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTrials } from "@/context/TrialContext";
import type { TrialPhase, TrialStatus } from "@/types/clinical-trial";

export default function CreateTrial() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTrial } = useTrials();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    phase: "" as TrialPhase | "",
    status: "" as TrialStatus | "",
    condition: "",
    location: "",
    enrollment: "",
    startDate: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.phase) e.phase = "Phase is required";
    if (!form.status) e.status = "Status is required";
    if (!form.condition.trim()) e.condition = "Condition is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.enrollment || Number(form.enrollment) <= 0) e.enrollment = "Valid enrollment target required";
    if (!form.startDate) e.startDate = "Start date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      addTrial({
        title: form.title.trim(),
        phase: form.phase as TrialPhase,
        status: form.status as TrialStatus,
        condition: form.condition.trim(),
        location: form.location.trim(),
        enrollment: Number(form.enrollment),
        startDate: form.startDate,
        description: form.description.trim(),
      });
      toast({ title: "Trial created", description: `"${form.title}" has been added successfully.` });
      setLoading(false);
      navigate("/");
    }, 500);
  };

  const field = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create New Clinical Trial</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Trial Title</Label>
              <Input id="title" value={form.title} onChange={(e) => field("title", e.target.value)} maxLength={200} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Phase</Label>
                <Select value={form.phase} onValueChange={(v) => field("phase", v)}>
                  <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phase I">Phase I</SelectItem>
                    <SelectItem value="Phase II">Phase II</SelectItem>
                    <SelectItem value="Phase III">Phase III</SelectItem>
                    <SelectItem value="Phase IV">Phase IV</SelectItem>
                  </SelectContent>
                </Select>
                {errors.phase && <p className="text-xs text-destructive">{errors.phase}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => field("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recruiting">Recruiting</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="condition">Condition</Label>
              <Input id="condition" value={form.condition} onChange={(e) => field("condition", e.target.value)} maxLength={200} />
              {errors.condition && <p className="text-xs text-destructive">{errors.condition}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => field("location", e.target.value)} maxLength={200} />
                {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enrollment">Enrollment Target</Label>
                <Input id="enrollment" type="number" min={1} value={form.enrollment} onChange={(e) => field("enrollment", e.target.value)} />
                {errors.enrollment && <p className="text-xs text-destructive">{errors.enrollment}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={(e) => field("startDate", e.target.value)} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => field("description", e.target.value)} rows={4} maxLength={1000} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Clinical Trial"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
