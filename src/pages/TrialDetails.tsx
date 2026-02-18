import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhaseBadge } from "@/components/PhaseBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { OverviewTab } from "@/components/OverviewTab";
import { EligibilityTab } from "@/components/EligibilityTab";
import { StudyPlanTab } from "@/components/StudyPlanTab";
import { OutcomesTab } from "@/components/OutcomesTab";
import { ParticipantsTab } from "@/components/ParticipantsTab";
import { RankingTab } from "@/components/RankingTab";
import { useTrials } from "@/context/TrialContext";

export default function TrialDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrialById, updateTrial } = useTrials();
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
    <div className="mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 bg-background/95 backdrop-blur px-4 pt-4 pb-4 border-b border-border lg:-mx-6 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{trial.title}</h1>
              <p className="text-sm text-muted-foreground">{trial.condition}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <PhaseBadge phase={trial.phase} />
            <StatusBadge status={trial.status} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Criteria</TabsTrigger>
          <TabsTrigger value="study-plan">Study Plan</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <OverviewTab trial={trial} onSave={(updates) => updateTrial(trial.id, updates)} />
        </TabsContent>

        <TabsContent value="eligibility" className="animate-fade-in">
          <EligibilityTab
            eligibility={trial.eligibility || { inclusion: [], exclusion: [] }}
            onSave={(eligibility) => updateTrial(trial.id, { eligibility })}
          />
        </TabsContent>

        <TabsContent value="study-plan" className="animate-fade-in">
          <StudyPlanTab
            studyPlan={trial.studyPlan}
            onSave={(studyPlan) => updateTrial(trial.id, { studyPlan })}
          />
        </TabsContent>

        <TabsContent value="outcomes" className="animate-fade-in">
          <OutcomesTab
            outcomes={trial.outcomes}
            onSave={(outcomes) => updateTrial(trial.id, { outcomes })}
          />
        </TabsContent>

        <TabsContent value="participants" className="animate-fade-in">
          <ParticipantsTab trialId={trial.id} participants={trial.participants || []} />
        </TabsContent>

        <TabsContent value="ranking" className="animate-fade-in">
          <RankingTab participants={trial.participants || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
