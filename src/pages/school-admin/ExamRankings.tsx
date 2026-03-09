import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { BarChart3, Trophy, Medal, Award } from "lucide-react";

const ExamRankings = () => {
  const [examId, setExamId] = useState("");

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"], queryFn: async () => { const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false }); return data || []; },
  });

  const { data: results = [] } = useQuery({
    queryKey: ["ranking-results", examId],
    queryFn: async () => {
      if (!examId) return [];
      const { data } = await supabase.from("exam_results").select("*, students(full_name, roll_no, classes(name, section))").eq("exam_id", examId);
      return data || [];
    },
    enabled: !!examId,
  });

  // Aggregate by student
  const studentMap = new Map<string, { name: string; roll: string; className: string; total: number; max: number }>();
  results.forEach((r: any) => {
    const key = r.student_id;
    const s = (r as any).students;
    if (!studentMap.has(key)) studentMap.set(key, {
      name: s?.full_name || "?", roll: s?.roll_no || "", className: `${s?.classes?.name || ""} ${s?.classes?.section || ""}`,
      total: 0, max: 0,
    });
    const rec = studentMap.get(key)!;
    rec.total += (r.marks_obtained || 0);
    rec.max += r.total_marks;
  });

  const rankings = Array.from(studentMap.entries())
    .map(([id, data]) => ({ id, ...data, pct: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  const rankIcons = [Trophy, Medal, Award];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Rankings & Analytics</h1><p className="text-muted-foreground text-sm mt-1">Performance-based student rankings</p></div>
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Select Exam" /></SelectTrigger>
            <SelectContent>{exams.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </motion.div>

        {rankings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rankings.slice(0, 3).map((s, i) => {
              const colors = ["from-yellow-400 to-amber-500", "from-gray-300 to-slate-400", "from-orange-300 to-amber-600"];
              const Icon = rankIcons[i];
              return (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}>
                  <Card className="shadow-card overflow-hidden">
                    <div className={`bg-gradient-to-r ${colors[i]} p-4 text-white text-center`}>
                      <Icon className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-2xl font-bold">#{i + 1}</div>
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-display font-bold">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.className} • Roll: {s.roll || "—"}</p>
                      <div className="mt-2"><Badge variant="default">{s.pct}% — {s.total}/{s.max}</Badge></div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Full Rankings</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead className="w-16">Rank</TableHead><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Total Marks</TableHead><TableHead>Percentage</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rankings.map((s, i) => (
                  <TableRow key={s.id} className={i < 3 ? "bg-primary/5" : ""}>
                    <TableCell className="font-bold text-lg">#{i + 1}</TableCell>
                    <TableCell><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">Roll: {s.roll || "—"}</div></TableCell>
                    <TableCell><Badge variant="outline">{s.className}</Badge></TableCell>
                    <TableCell className="font-medium">{s.total}/{s.max}</TableCell>
                    <TableCell><Badge variant={s.pct >= 60 ? "default" : "destructive"}>{s.pct}%</Badge></TableCell>
                  </TableRow>
                ))}
                {rankings.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{examId ? "No results for this exam" : "Select an exam to view rankings"}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ExamRankings;
