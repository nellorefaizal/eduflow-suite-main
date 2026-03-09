import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TeacherTimetable = () => {
  const { user } = useAuth();
  const { data: timetable = [], isLoading } = useQuery({
    queryKey: ["teacher-timetable", user?.id],
    queryFn: async () => {
      const { data: teacher } = await supabase.from("teachers").select("id, school_id").eq("user_id", user?.id).single();
      if (!teacher) {
        const { data } = await supabase.from("timetable").select("*, classes(name, section), subjects(name)").limit(50);
        return data || [];
      }
      const { data } = await supabase.from("timetable").select("*, classes(name, section), subjects(name)")
        .eq("school_id", teacher.school_id).order("day_of_week").order("start_time");
      return data || [];
    },
    enabled: !!user?.id,
  });

  const groupedByDay = days.map((day, idx) => ({
    day, slots: timetable.filter((t: any) => t.day_of_week === idx),
  }));

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
          <p className="text-muted-foreground mt-1">Weekly teaching schedule</p>
        </div>
        {isLoading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div> : (
          <div className="space-y-4">
            {groupedByDay.map((d, i) => (
              <motion.div key={d.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
                <div className="px-5 py-3 bg-muted/30 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">{d.day}</h3>
                </div>
                {d.slots.length > 0 ? (
                  <div className="divide-y divide-border/30">
                    {d.slots.map((slot: any) => (
                      <div key={slot.id} className="px-5 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground w-32 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {slot.start_time?.slice(0,5)} - {slot.end_time?.slice(0,5)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-foreground">{slot.subjects?.name || "—"}</span>
                          <span className="text-muted-foreground text-sm ml-2">({slot.classes?.name} {slot.classes?.section || ""})</span>
                        </div>
                        {slot.room && <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{slot.room}</span>}
                      </div>
                    ))}
                  </div>
                ) : (<div className="px-5 py-4 text-sm text-muted-foreground">No classes</div>)}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherTimetable;