import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrials } from "@/context/TrialContext";

export default function PatientDetail() {
  const { id: trialId, patientId } = useParams<{ id: string; patientId: string }>();
  const navigate = useNavigate();
  const { getTrialById } = useTrials();
  const trial = trialId ? getTrialById(trialId) : undefined;
  const patient = trial?.participants?.find((p) => p.id === patientId);

  if (!trial || !patient) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">Patient not found</h2>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(trialId ? `/trial/${trialId}` : "/")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <Button variant="ghost" onClick={() => navigate(`/trial/${trialId}`)} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Trial
      </Button>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Patient {patient.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Age</p>
              <p className="text-sm font-semibold text-foreground">{patient.age} years</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Sex</p>
              <p className="text-sm font-semibold text-foreground">{patient.sex}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Topic ID</p>
              <p className="text-sm font-semibold text-foreground">{patient.topicId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Entities */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Clinical Entities</h3>
        {patient.clinicalEntities.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {patient.clinicalEntities.map((entity, idx) => (
              <Card key={idx} className="hover-scale transition-shadow hover:shadow-md">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{entity.entityType}</Badge>
                    {entity.negated ? (
                      <span className="flex items-center gap-1 text-xs text-destructive"><ShieldAlert className="h-3 w-3" /> Negated</span>
                    ) : (

                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-3 w-3" /> Confirmed</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{entity.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><span className="font-medium">Severity:</span> {entity.severity}</div>
                    <div><span className="font-medium">Duration:</span> {entity.duration}</div>
                    <div className="col-span-2"><span className="font-medium">Temporal:</span> {entity.temporalContext}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No clinical entities recorded.</p>
        )}
      </div>

      {/* Semantic Representations */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Semantic Representations</h3>
        {patient.semanticRepresentations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.semanticRepresentations.map((rep, idx) => (
              <Badge key={idx} variant="outline" className="rounded-full px-3 py-1 text-sm">
                {rep}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No semantic representations.</p>
        )}
      </div>
    </div>
  );
}
