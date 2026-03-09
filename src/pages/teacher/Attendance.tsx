import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, XCircle, Clock, Save } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const qc = useQueryClient();

  const { data: teacherData } = useQuery({
    queryKey: ["teacher-data", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["teacher-att-classes", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name, section").eq("school_id", teacherData!.school_id);
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["class-students-att", selectedClass],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("id, full_name, roll_no").eq("class_id", selectedClass).eq("status", "active").order("roll_no");
      return data || [];
    },
    enabled: !!selectedClass,
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["existing-att", selectedClass, date],
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("student_id, status").eq("class_id", selectedClass).eq("date", date);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(a => { map[a.student_id] = a.status; });
        setAttendance(map);
      }
      return data || [];
    },
    enabled: !!selectedClass && !!date,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!teacherData) throw new Error("Teacher not found");
      // Delete existing then insert
      await supabase.from("attendance").delete().eq("class_id", selectedClass).eq("date", date);
      const records = students.map(s => ({
        student_id: s.id, school_id: teacherData.school_id, class_id: selectedClass,
        date, status: attendance[s.id] || "present", marked_by: user?.id,
      }));
      const { error } = await supabase.from("attendance").insert(records);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Attendance saved!"); qc.invalidateQueries({ queryKey: ["existing-att"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const markAll = (status: string) => {
    const map: Record<string, string> = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendance(map);
  };

  const statusIcons: Record<string, { icon: typeof CheckCircle2; class: string }> = {
    present: { icon: CheckCircle2, class: "text-success bg-success/10 border-success/30" },
    absent: { icon: XCircle, class: "text-destructive bg-destructive/10 border-destructive/30" },
    late: { icon: Clock, class: "text-warning bg-warning/10 border-warning/30" },
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">Mark daily attendance for your classes</p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm" />
          {selectedClass && students.length > 0 && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={() => markAll("present")}>All Present</Button>
              <Button variant="outline" size="sm" onClick={() => markAll("absent")}>All Absent</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>

        {selectedClass && students.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium w-16">Roll</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Student</th>
                  <th className="text-center py-3 px-5 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const status = attendance[s.id] || "present";
                  return (
                    <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-5 text-muted-foreground font-mono">{s.roll_no || "—"}</td>
                      <td className="py-3 px-5 font-medium text-foreground">{s.full_name}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-2">
                          {(["present", "absent", "late"] as const).map(st => {
                            const cfg = statusIcons[st];
                            return (
                              <button key={st} onClick={() => setAttendance(prev => ({ ...prev, [s.id]: st }))}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${status === st ? cfg.class + " border-2" : "text-muted-foreground bg-muted/30 border-transparent hover:bg-muted/50"}`}>
                                <cfg.icon className="w-3.5 h-3.5 inline mr-1" />{st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {selectedClass && students.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No students in this class</div>
        )}
        {!selectedClass && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p>Select a class to start marking attendance</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
