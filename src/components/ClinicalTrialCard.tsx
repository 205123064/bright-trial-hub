import { useNavigate } from "react-router-dom";
import { MapPin, Users, Calendar } from "lucide-react";
import type { ClinicalTrial } from "@/types/clinical-trial";
import { PhaseBadge } from "./PhaseBadge";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  trial: ClinicalTrial;
}


export function ClinicalTrialCard({ trial }: Props) {
  const navigate = useNavigate();
  const formattedDate = trial.startDate
  ? new Date(trial.startDate).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  : "—";
  return (
    <Card className="group flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold leading-tight text-card-foreground">
          {trial.title}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <PhaseBadge phase={trial.phase} />
          <StatusBadge status={trial.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 text-sm">
        <p><span className="font-medium text-primary underline">Condition:</span>{" "}<span className="text-card-foreground">{trial.condition}</span></p>
        <p className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{trial.location}</p>
        <p className="flex items-center gap-1.5 text-muted-foreground"><Users className="h-3.5 w-3.5" />{trial.enrollment} participants</p>
        <p className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{formattedDate}</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/trial/${trial.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
