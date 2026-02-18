import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/types/clinical-trial";

interface Props {
  patient: Patient;
}

export function ExpandablePatientDetails({ patient }: Props) {
  return (
    <div className="animate-fade-in space-y-5 rounded-lg bg-muted/40 p-4">
      {/* Demographics */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Demographics</h4>
        <div className="flex gap-6 text-sm">
          <span className="text-muted-foreground">Age: <span className="font-medium text-foreground">{patient.age}</span></span>
          <span className="text-muted-foreground">Sex: <span className="font-medium text-foreground">{patient.sex}</span></span>
        </div>
      </div>

      {/* Clinical Entities */}
      {patient.clinicalEntities.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Clinical Entities</h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {patient.clinicalEntities.map((e, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">{e.entityType}</Badge>
                  <Badge variant={e.negated ? "destructive" : "default"} className="text-[10px]">
                    {e.negated ? "Negated" : "Confirmed"}
                  </Badge>
                </div>
                <p className="font-medium text-sm text-foreground">{e.name}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                  <span>Severity: <span className="text-foreground">{e.severity}</span></span>
                  <span>Duration: <span className="text-foreground">{e.duration}</span></span>
                  <span className="col-span-2">Temporal: <span className="text-foreground">{e.temporalContext}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic Representations */}
      {patient.semanticRepresentations.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Semantic Representations</h4>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {patient.semanticRepresentations.map((s, i) => (
              <span key={i} className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
