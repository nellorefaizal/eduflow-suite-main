import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const TeacherExamResults = () => {
  const { user } = useAuth();
  const [selectedExam, setSelectedExam] = useState("");

  const { data: teacherData } = useQuery({
    queryKey: ["t-exam-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["t-exams-list", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("exams").select("id, name").eq("school_id", teacherData!.school_id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: results = [] } = useQuery({
    queryKey: ["exam-results", selectedExam],
    queryFn: async () => {
      const { data } = await supabase.from("exam_results").select("*, students(full_name, roll_no), subjects(name)")
        .eq("exam_id", selectedExam).order("marks_obtained", { ascending: false });
      return data || [];
    },
    enabled: !!selectedExam,
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground mt-1">View and manage student exam results</p>
        </div>
        <Select value={selectedExam} onValueChange={setSelectedExam}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select Exam" /></SelectTrigger>
          <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
        </Select>
        {selectedExam && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Roll</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Student</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Subject</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Marks</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Grade</th>
              </tr></thead>
              <tbody>
                {results.map((r: any) => (
                  <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-5 text-muted-foreground font-mono">{r.students?.roll_no || "—"}</td>
                    <td className="py-3 px-5 font-medium text-foreground">{r.students?.full_name || "—"}</td>
                    <td className="py-3 px-5 text-muted-foreground">{r.subjects?.name || "—"}</td>
                    <td className="py-3 px-5 text-foreground font-semibold">{r.marks_obtained ?? "—"}/{r.total_marks}</td>
                    <td className="py-3 px-5"><span className="px-2 py-1 rounded text-xs font-medium bg-accent/10 text-accent">{r.grade || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        {selectedExam && results.length === 0 && <div className="text-center py-12 text-muted-foreground">No results for this exam</div>}
        {!selectedExam && <div className="text-center py-12 text-muted-foreground"><FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><p>Select an exam to view results</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default TeacherExamResults;