import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Timetable = () => {
  const [selectedClass, setSelectedClass] = useState("all");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });

  const { data: timetable = [] } = useQuery({
    queryKey: ["timetable", selectedClass],
    queryFn: async () => {
      let q = supabase.from("timetable").select("*, subjects(name, code), teachers(full_name), classes(name, section)").order("start_time");
      if (selectedClass !== "all") q = q.eq("class_id", selectedClass);
      const { data } = await q;
      return data || [];
    },
  });

  const groupByDay = (day: number) => timetable.filter((t: any) => t.day_of_week === day);
  const colors = ["bg-primary/10 border-primary/20", "bg-accent/10 border-accent/20", "bg-emerald-500/10 border-emerald-500/20", "bg-violet-500/10 border-violet-500/20", "bg-rose-500/10 border-rose-500/20", "bg-sky-500/10 border-sky-500/20"];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Timetable</h1><p className="text-muted-foreground text-sm mt-1">Weekly class schedule</p></div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}
            </SelectContent>
          </Select>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day, dayIdx) => {
            const periods = groupByDay(dayIdx + 1);
            return (
              <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIdx * 0.08 }}>
                <Card className="shadow-card h-full">
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{day}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {periods.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No periods scheduled</p>}
                    {periods.map((p: any, i: number) => (
                      <div key={p.id} className={`p-3 rounded-lg border ${colors[i % colors.length]} transition-all hover:scale-[1.02]`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{(p as any).subjects?.name || "Free"}</span>
                          <Badge variant="outline" className="text-[10px]">{(p as any).subjects?.code}</Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-muted-foreground">{p.start_time} – {p.end_time}</span>
                          <span className="text-xs text-muted-foreground">{p.room}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{(p as any).teachers?.full_name || "—"} {selectedClass === "all" && `• ${(p as any).classes?.name} ${(p as any).classes?.section || ""}`}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;
