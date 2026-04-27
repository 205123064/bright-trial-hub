import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrials } from "@/context/TrialContext";
import { ClinicalTrialCard } from "@/components/ClinicalTrialCard";
import { TrialFilters } from "@/components/TrialFilters";
import type { TrialFilters as TF } from "@/types/clinical-trial";

const Index = () => {
  const navigate = useNavigate();
  const { trials, loading, error, refresh } = useTrials();
  const [filters, setFilters] = useState<TF>({
    search: "",
    phase: "",
    status: "",
    location: "",
    sortBy: "newest",
  });

  const locations = useMemo(
    () => [...new Set(trials.map((t) => t.location))].sort(),
    [trials]
  );

  const filtered = useMemo(() => {
    let result = [...trials];
    const q = filters.search.toLowerCase();
    if (q) result = result.filter((t) => t.title.toLowerCase().includes(q) || t.condition.toLowerCase().includes(q));
    if (filters.phase) result = result.filter((t) => t.phase === filters.phase);
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    if (filters.location) result = result.filter((t) => t.location === filters.location);
    result.sort((a, b) => {
      const da = new Date(a.startDate).getTime();
      const db = new Date(b.startDate).getTime();
      return filters.sortBy === "newest" ? db - da : da - db;
    });
    return result;
  }, [trials, filters]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, Dr. Patel 👋</h1>
          <p className="text-muted-foreground">Manage and monitor your clinical trials efficiently.</p>
        </div>
        <Button size="lg" onClick={() => navigate("/create-trial")} className="shrink-0">
          <Plus className="mr-2 h-5 w-5" /> Create New Clinical Trial
        </Button>
      </div>

      {/* Filters */}
      <TrialFilters filters={filters} locations={locations} onChange={setFilters} />

      {/* Loading */}
      {loading && trials.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading clinical trials...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-12 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Could not load trials</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((trial) => (
            <ClinicalTrialCard key={trial.id} trial={trial} />
          ))}
        </div>
      ) : !loading && !error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold text-foreground">No trials found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      ) : null}
    </div>
  );
};

export default Index;
