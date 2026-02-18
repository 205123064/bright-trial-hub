import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Patient } from "@/types/clinical-trial";

interface Props {
  trialId: string;
  participants: Patient[];
}

export function ParticipantsTab({ trialId, participants }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    console.log(file);
  };

  const filtered = useMemo(() => {
    let result = [...participants];
    const q = search.toLowerCase();
    if (q) result = result.filter((p) => p.id.toLowerCase().includes(q) || p.topicId.toLowerCase().includes(q) || p.semanticRepresentations.some((s) => s.toLowerCase().includes(q)));
    if (sexFilter) result = result.filter((p) => p.sex === sexFilter);
    if (ageMin) result = result.filter((p) => p.age >= Number(ageMin));
    if (ageMax) result = result.filter((p) => p.age <= Number(ageMax));
    return result;
  }, [participants, search, sexFilter, ageMin, ageMax]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Participants</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Add Participant
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by ID, topic, or keyword..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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

      {filtered.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Topic ID</TableHead>
                <TableHead>Key Summary</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.age}</TableCell>
                  <TableCell>{p.sex}</TableCell>
                  <TableCell>{p.topicId}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{p.semanticRepresentations[0] || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/trial/${trialId}/patient/${p.id}`)}>
                      <Eye className="mr-1 h-3.5 w-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
          <Search className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No participants found.</p>
        </div>
      )}
    </div>
  );
}
