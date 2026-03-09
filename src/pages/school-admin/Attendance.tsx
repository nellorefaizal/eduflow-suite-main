import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, UserCheck, UserX, Clock, CheckCircle2 } from "lucide-react";

const Attendance = () => {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-for-attendance", selectedClass],
    queryFn: async () => {
      let q = supabase.from("students").select("*, classes(name, section)").eq("status", "active").order("full_name");
      if (selectedClass !== "all") q = q.eq("class_id", selectedClass);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: attendance = [], refetch } = useQuery({
    queryKey: ["attendance", selectedDate, selectedClass],
    queryFn: async () => {
      let q = supabase.from("attendance").select("*").eq("date", selectedDate);
      if (selectedClass !== "all") q = q.eq("class_id", selectedClass);
      const { data } = await q;
      return data || [];
    },
  });

  const getStatus = (studentId: string) => {
    const rec = attendance.find((a: any) => a.student_id === studentId);
    return rec?.status || "not_marked";
  };

  const markAttendance = async (studentId: string, status: string) => {
    const existing = attendance.find((a: any) => a.student_id === studentId);
    const student = students.find((s: any) => s.id === studentId) as any;
    if (existing) {
      await supabase.from("attendance").update({ status }).eq("id", (existing as any).id);
    } else {
      await supabase.from("attendance").insert({ student_id: studentId, school_id: student?.school_id, class_id: student?.class_id, date: selectedDate, status });
    }
    refetch();
    toast.success(`Marked ${status}`);
  };

  const present = attendance.filter((a: any) => a.status === "present").length;
  const absent = attendance.filter((a: any) => a.status === "absent").length;
  const late = attendance.filter((a: any) => a.status === "late").length;

  const statusColors: Record<string, string> = { present: "bg-emerald-500", absent: "bg-destructive", late: "bg-amber-500", not_marked: "bg-muted-foreground" };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Daily Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Mark and track student attendance</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Present", value: present, icon: UserCheck, color: "text-emerald-600" },
            { label: "Absent", value: absent, icon: UserX, color: "text-destructive" },
            { label: "Late", value: late, icon: Clock, color: "text-amber-600" },
            { label: "Total", value: students.length, icon: CalendarDays, color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-background border-input" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {students.map((s: any) => {
                  const status = getStatus(s.id);
                  return (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.full_name.charAt(0)}</div><span className="font-medium text-sm">{s.full_name}</span></div></TableCell>
                      <TableCell><Badge variant="outline">{s.classes?.name} {s.classes?.section}</Badge></TableCell>
                      <TableCell><Badge className={`${statusColors[status]} text-white border-0`}>{status === "not_marked" ? "Not Marked" : status.charAt(0).toUpperCase() + status.slice(1)}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          {["present", "absent", "late"].map(st => (
                            <Button key={st} size="sm" variant={status === st ? "default" : "outline"} className="text-xs h-7 px-2.5" onClick={() => markAttendance(s.id, st)}>
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {students.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Select a class to view students</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
