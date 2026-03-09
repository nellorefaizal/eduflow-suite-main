import { motion } from "framer-motion";
import { Award } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const statusStyles: Record<string, { class: string }> = {
  scheduled: { class: "text-info bg-info/10" },
  ongoing: { class: "text-warning bg-warning/10" },
  completed: { class: "text-success bg-success/10" },
};

const TeacherExams = () => {
  const { user } = useAuth();
  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["teacher-exams", user?.id],
    queryFn: async () => {
      const { data: teacher } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      if (!teacher) return [];
      const { data } = await supabase.from("exams").select("*").eq("school_id", teacher.school_id).order("start_date", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exams</h1>
          <p className="text-muted-foreground mt-1">View upcoming and past examinations</p>
        </div>
        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div> : (
          <div className="space-y-3">
            {exams.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-xl bg-card shadow-card border border-border/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{e.name}</h3>
                  <div className="text-xs text-muted-foreground mt-1">
                    {e.exam_type?.replace("_", " ")} • {e.start_date ? new Date(e.start_date).toLocaleDateString() : "TBD"} — {e.end_date ? new Date(e.end_date).toLocaleDateString() : "TBD"}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[e.status]?.class || "text-muted-foreground bg-muted"}`}>{e.status}</span>
              </motion.div>
            ))}
            {exams.length === 0 && <div className="text-center py-12 text-muted-foreground">No exams found</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherExams;