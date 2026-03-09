import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TeacherClasses = () => {
  const { user } = useAuth();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["teacher-classes", user?.id],
    queryFn: async () => {
      // Get teacher record
      const { data: teacher } = await supabase.from("teachers").select("id, school_id").eq("user_id", user?.id).single();
      if (!teacher) return [];
      // Get classes and timetable for this teacher
      const { data: timetableData } = await supabase.from("timetable").select("*, classes(id, name, section, capacity), subjects(name, code)")
        .eq("teacher_id", teacher.id);
      if (!timetableData) return [];
      // Group by class
      const classMap = new Map<string, any>();
      timetableData.forEach((t: any) => {
        if (!t.classes) return;
        const key = t.classes.id;
        if (!classMap.has(key)) {
          classMap.set(key, { ...t.classes, subjects: [], days: new Set() });
        }
        const entry = classMap.get(key);
        if (t.subjects) entry.subjects.push(t.subjects.name);
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        entry.days.add(days[t.day_of_week] || "");
      });
      return Array.from(classMap.values()).map((c: any) => ({
        ...c, subjects: [...new Set(c.subjects)], days: [...c.days].filter(Boolean).join(", "),
      }));
    },
    enabled: !!user?.id,
  });

  // Fallback: show all classes from the school
  const { data: allClasses = [] } = useQuery({
    queryKey: ["all-classes-teacher"],
    queryFn: async () => {
      const { data: teacher } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      if (!teacher) {
        // Not linked as teacher, try getting school's classes
        const { data } = await supabase.from("classes").select("*, subjects:timetable(subjects(name))").limit(20);
        return data || [];
      }
      const { data } = await supabase.from("classes").select("*").eq("school_id", teacher.school_id);
      return data || [];
    },
    enabled: !!user?.id && classes.length === 0,
  });

  const displayClasses = classes.length > 0 ? classes : allClasses;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground mt-1">View your assigned classes and subjects</p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayClasses.map((cls: any, i: number) => (
              <motion.div key={cls.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cls.name}{cls.section ? ` - ${cls.section}` : ""}</h3>
                    {cls.subjects?.length > 0 && <p className="text-xs text-muted-foreground">{cls.subjects.join(", ")}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cls.capacity || 0} students</span>
                  {cls.days && <span>• {cls.days}</span>}
                </div>
              </motion.div>
            ))}
            {displayClasses.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">No classes assigned yet</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherClasses;
