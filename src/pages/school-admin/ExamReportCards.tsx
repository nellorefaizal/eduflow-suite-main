import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Award, Printer, Download } from "lucide-react";

const ExamReportCards = () => {
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"], queryFn: async () => { const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false }); return data || []; },
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });
  const { data: results = [] } = useQuery({
    queryKey: ["report-card-results", examId, classId],
    queryFn: async () => {
      if (!examId) return [];
      let q = supabase.from("exam_results").select("*, students(full_name, roll_no, class_id), subjects(name)").eq("exam_id", examId);
      const { data } = await q;
      if (!data) return [];
      if (classId) return data.filter((r: any) => (r as any).students?.class_id === classId);
      return data;
    },
    enabled: !!examId,
  });

  // Group by student
  const studentMap = new Map<string, { name: string; roll: string; subjects: { name: string; marks: number; total: number }[]; totalMarks: number; totalMax: number }>();
  results.forEach((r: any) => {
    const studentName = (r as any).students?.full_name || "Unknown";
    const roll = (r as any).students?.roll_no || "";
    const key = r.student_id;
    if (!studentMap.has(key)) studentMap.set(key, { name: studentName, roll, subjects: [], totalMarks: 0, totalMax: 0 });
    const rec = studentMap.get(key)!;
    rec.subjects.push({ name: (r as any).subjects?.name || "?", marks: r.marks_obtained || 0, total: r.total_marks });
    rec.totalMarks += (r.marks_obtained || 0);
    rec.totalMax += r.total_marks;
  });

  const students = Array.from(studentMap.entries()).map(([id, data]) => ({
    id, ...data, pct: data.totalMax > 0 ? Math.round((data.totalMarks / data.totalMax) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct);

  const getGrade = (pct: number) => {
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B+";
    if (pct >= 60) return "B";
    if (pct >= 50) return "C";
    if (pct >= 40) return "D";
    return "F";
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Report Cards</h1><p className="text-muted-foreground text-sm mt-1">Generate student report cards</p></div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Button>
        </motion.div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
                <SelectContent>{exams.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent><SelectItem value="">All Classes</SelectItem>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {students.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card print:break-inside-avoid">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Roll: {s.roll || "—"}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-lg px-3 py-1 ${s.pct >= 60 ? "bg-emerald-500" : s.pct >= 40 ? "bg-amber-500" : "bg-destructive"} text-white border-0`}>
                      {getGrade(s.pct)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{s.pct}% — {s.totalMarks}/{s.totalMax}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="bg-muted/30"><TableHead>Subject</TableHead><TableHead>Marks</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {s.subjects.map((sub, j) => {
                      const sp = sub.total > 0 ? Math.round((sub.marks / sub.total) * 100) : 0;
                      return (
                        <TableRow key={j}><TableCell>{sub.name}</TableCell><TableCell className="font-medium">{sub.marks}</TableCell><TableCell>{sub.total}</TableCell><TableCell><Badge variant="outline">{getGrade(sp)}</Badge></TableCell></TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {examId && students.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No results found for this exam</CardContent></Card>}
      </div>
    </DashboardLayout>
  );
};

export default ExamReportCards;
