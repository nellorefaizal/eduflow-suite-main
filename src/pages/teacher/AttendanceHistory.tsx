import { motion } from "framer-motion";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusIcons: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  present: { icon: CheckCircle2, class: "text-success" },
  absent: { icon: XCircle, class: "text-destructive" },
  late: { icon: Clock, class: "text-warning" },
};

const TeacherAttendanceHistory = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: teacherData } = useQuery({
    queryKey: ["t-att-hist-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["t-att-hist-classes", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name, section").eq("school_id", teacherData!.school_id);
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: records = [] } = useQuery({
    queryKey: ["att-history", selectedClass, date],
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("*, students(full_name, roll_no)")
        .eq("class_id", selectedClass).eq("date", date).order("created_at");
      return data || [];
    },
    enabled: !!selectedClass,
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance History</h1>
          <p className="text-muted-foreground mt-1">View past attendance records</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
          </Select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm" />
        </div>
        {selectedClass && records.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Roll</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Student</th>
                <th className="text-center py-3 px-5 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Remarks</th>
              </tr></thead>
              <tbody>
                {records.map((r: any) => {
                  const st = statusIcons[r.status] || statusIcons.present;
                  return (
                    <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-5 text-muted-foreground font-mono">{r.students?.roll_no || "—"}</td>
                      <td className="py-3 px-5 font-medium text-foreground">{r.students?.full_name || "—"}</td>
                      <td className="py-3 px-5 text-center"><span className={`inline-flex items-center gap-1 capitalize ${st.class}`}><st.icon className="w-4 h-4" /> {r.status}</span></td>
                      <td className="py-3 px-5 text-muted-foreground">{r.remarks || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
        {selectedClass && records.length === 0 && <div className="text-center py-12 text-muted-foreground">No records for this date</div>}
        {!selectedClass && <div className="text-center py-12 text-muted-foreground"><History className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><p>Select a class</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendanceHistory;