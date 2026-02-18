import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, Trophy, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoreBadge, getScoreConfig } from "@/components/ScoreBadge";
import { ScoreProgressBar } from "@/components/ScoreProgressBar";
import { ExpandablePatientDetails } from "@/components/ExpandablePatientDetails";
import { cn } from "@/lib/utils";
import type { Patient } from "@/types/clinical-trial";

interface Props {
  participants: Patient[];
}

function getBorderColor(score: number) {
  if (score >= 80) return "border-l-[hsl(var(--success))]";
  if (score >= 50) return "border-l-[hsl(var(--warning))]";
  return "border-l-[hsl(var(--destructive))]";
}

export function RankingTab({ participants }: Props) {
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    let result = [...participants];
    const q = search.toLowerCase();
    if (q) result = result.filter((p) => p.id.toLowerCase().includes(q));
    if (sexFilter && sexFilter !== "all") result = result.filter((p) => p.sex === sexFilter);
    if (ageMin) result = result.filter((p) => p.age >= Number(ageMin));
    if (ageMax) result = result.filter((p) => p.age <= Number(ageMax));
    if (minScore > 0) result = result.filter((p) => p.rankingScore >= minScore);
    return result.sort((a, b) => b.rankingScore - a.rankingScore);
  }, [participants, search, sexFilter, ageMin, ageMax, minScore]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Patient Eligibility Ranking</h3>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by Patient ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sexFilter} onValueChange={setSexFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sex" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sexes</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Age min" className="w-[100px]" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
          <Input type="number" placeholder="Age max" className="w-[100px]" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Min Score: {minScore}</span>
          <Slider value={[minScore]} onValueChange={([v]) => setMinScore(v)} max={100} step={1} className="max-w-xs" />
        </div>
      </div>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead className="min-w-[200px]">Match Score</TableHead>
                <TableHead className="w-[40px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((p, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;
                const isExpanded = expandedId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <TableRow
                      className={cn(
                        "cursor-pointer border-l-4 transition-colors hover:bg-muted/50",
                        getBorderColor(p.rankingScore),
                        isTop3 && "bg-primary/[0.03]",
                        isExpanded && "bg-muted/30"
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <TableCell className="font-bold">
                        {isTop3 ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {rank}
                          </span>
                        ) : rank}
                      </TableCell>
                      <TableCell className="font-medium">{p.id}</TableCell>
                      <TableCell>{p.age}</TableCell>
                      <TableCell>{p.sex}</TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <ScoreBadge score={p.rankingScore} />
                          <ScoreProgressBar score={p.rankingScore} />
                        </div>
                      </TableCell>
                      <TableCell>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4">
                            <ExpandablePatientDetails patient={p} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
          <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No patients match the current filters.</p>
        </div>
      )}
    </div>
  );
}
