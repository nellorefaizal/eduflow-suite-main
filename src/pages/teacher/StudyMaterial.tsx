import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TeacherStudyMaterial = () => {
  const { user } = useAuth();
  const { data: subjects = [] } = useQuery({
    queryKey: ["t-study-subjects", user?.id],
    queryFn: async () => {
      const { data: teacher } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      if (!teacher) return [];
      const { data } = await supabase.from("subjects").select("*").eq("school_id", teacher.school_id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Material</h1>
          <p className="text-muted-foreground mt-1">Manage and share study materials</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{s.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.code || "No code"} · {s.description || "No description"}</p>
            </motion.div>
          ))}
          {subjects.length === 0 && <div className="col-span-full text-center py-12 text-muted-foreground">No subjects found</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudyMaterial;