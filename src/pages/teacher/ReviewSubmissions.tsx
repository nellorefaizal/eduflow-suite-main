import { motion } from "framer-motion";
import { FileCheck, CheckCircle2, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TeacherReviewSubmissions = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState("");

  const { data: teacherData } = useQuery({
    queryKey: ["t-rev-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["t-assignments-list", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("assignments").select("id, title").eq("school_id", teacherData!.school_id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["submissions", selectedAssignment],
    queryFn: async () => {
      const { data } = await supabase.from("assignment_submissions").select("*, students(full_name, roll_no)")
        .eq("assignment_id", selectedAssignment).order("submitted_at", { ascending: false });
      return data || [];
    },
    enabled: !!selectedAssignment,
  });

  const gradeMutation = useMutation({
    mutationFn: async ({ id, marks, feedback }: { id: string; marks: number; feedback: string }) => {
      const { error } = await supabase.from("assignment_submissions").update({ marks, feedback, graded_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["submissions"] }); toast.success("Graded"); },
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Submissions</h1>
          <p className="text-muted-foreground mt-1">Grade student assignment submissions</p>
        </div>
        <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select Assignment" /></SelectTrigger>
          <SelectContent>{assignments.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
        </Select>
        {selectedAssignment && submissions.length > 0 && (
          <div className="space-y-3">
            {submissions.map((s: any, i: number) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-xl bg-card shadow-card border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{s.students?.full_name || "—"}</h3>
                    <p className="text-xs text-muted-foreground">Roll: {s.students?.roll_no || "—"} · Submitted: {new Date(s.submitted_at).toLocaleDateString()}</p>
                  </div>
                  {s.graded_at ? (
                    <span className="flex items-center gap-1 text-success text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Graded: {s.marks}</span>
                  ) : (
                    <span className="flex items-center gap-1 text-warning text-xs"><Clock className="w-3.5 h-3.5" /> Pending</span>
                  )}
                </div>
                {s.submission_text && <p className="text-sm text-muted-foreground mb-3 bg-muted/30 p-3 rounded-lg">{s.submission_text}</p>}
                {!s.graded_at && (
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); gradeMutation.mutate({ id: s.id, marks: Number(fd.get("marks")), feedback: fd.get("feedback") as string }); }}
                    className="flex gap-3 items-end">
                    <div className="w-24"><Input name="marks" type="number" placeholder="Marks" required /></div>
                    <div className="flex-1"><Input name="feedback" placeholder="Feedback" /></div>
                    <Button size="sm" type="submit">Grade</Button>
                  </form>
                )}
              </motion.div>
            ))}
          </div>
        )}
        {selectedAssignment && submissions.length === 0 && <div className="text-center py-12 text-muted-foreground">No submissions</div>}
        {!selectedAssignment && <div className="text-center py-12 text-muted-foreground"><FileCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><p>Select an assignment</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default TeacherReviewSubmissions;