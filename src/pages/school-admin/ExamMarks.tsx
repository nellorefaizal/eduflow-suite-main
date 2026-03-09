import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FileCheck, Save } from "lucide-react";

const ExamMarks = () => {
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classId, setClassId] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"], queryFn: async () => { const { data } = await supabase.from("exams").select("*").order("created_at", { ascending: false }); return data || []; },
  });
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"], queryFn: async () => { const { data } = await supabase.from("subjects").select("*").order("name"); return data || []; },
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });
  const { data: students = [] } = useQuery({
    queryKey: ["students-marks", classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data } = await supabase.from("students").select("*").eq("class_id", classId).eq("status", "active").order("full_name");
      return data || [];
    },
    enabled: !!classId,
  });
  const { data: existingResults = [] } = useQuery({
    queryKey: ["existing-results", examId, subjectId],
    queryFn: async () => {
      if (!examId || !subjectId) return [];
      const { data } = await supabase.from("exam_results").select("*").eq("exam_id", examId).eq("subject_id", subjectId);
      return data || [];
    },
    enabled: !!examId && !!subjectId,
  });

  // Populate marks from existing results
  useState(() => {
    const m: Record<string, string> = {};
    existingResults.forEach((r: any) => { m[r.student_id] = String(r.marks_obtained ?? ""); });
    setMarks(m);
  });

  const handleSave = async () => {
    if (!examId || !subjectId) return toast.error("Select exam and subject");
    const entries = Object.entries(marks).filter(([_, v]) => v !== "");
    if (entries.length === 0) return toast.error("Enter marks first");

    for (const [studentId, marksVal] of entries) {
      const existing = existingResults.find((r: any) => r.student_id === studentId);
      if (existing) {
        await supabase.from("exam_results").update({ marks_obtained: Number(marksVal) }).eq("id", (existing as any).id);
      } else {
        const student = students.find((s: any) => s.id === studentId) as any;
        await supabase.from("exam_results").insert({
          exam_id: examId, subject_id: subjectId, student_id: studentId,
          marks_obtained: Number(marksVal), total_marks: 100,
        });
      }
    }
    toast.success(`Marks saved for ${entries.length} students`);
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Marks Entry</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter and manage student exam marks</p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Select Exam & Subject</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
                <SelectContent>{exams.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {classId && examId && subjectId && (
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Enter Marks (out of 100)</CardTitle>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Save All</Button>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50">
                  <TableHead>Student</TableHead><TableHead>Roll No</TableHead><TableHead className="w-32">Marks</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.roll_no || "—"}</TableCell>
                      <TableCell>
                        <Input
                          type="number" min="0" max="100" className="w-24 h-8"
                          value={marks[s.id] || ""}
                          onChange={e => setMarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                          placeholder="0-100"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No students in this class</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamMarks;
