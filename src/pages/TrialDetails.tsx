import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseBadge } from "@/components/PhaseBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useTrials } from "@/context/TrialContext";

export default function TrialDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrialById } = useTrials();
  const trial = id ? getTrialById(id) : undefined;

  if (!trial) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">Trial not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-6">
      <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-2xl">{trial.title}</CardTitle>
            <div className="flex gap-2">
              <PhaseBadge phase={trial.phase} />
              <StatusBadge status={trial.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={trial.location} />
            <InfoRow icon={<Users className="h-4 w-4" />} label="Enrollment" value={`${trial.enrollment} participants`} />
            <InfoRow icon={<Calendar className="h-4 w-4" />} label="Start Date" value={new Date(trial.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
            <InfoRow label="Condition" value={trial.condition} />
          </div>
          {trial.description && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{trial.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
