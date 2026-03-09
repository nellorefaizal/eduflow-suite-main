import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { BarChart3, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";

const AttendanceReports = () => {
  const [selectedClass, setSelectedClass] = useState("all");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance-reports", selectedClass],
    queryFn: async () => {
      let q = supabase.from("attendance").select("*, students(full_name, class_id), classes(name, section)");
      if (selectedClass !== "all") q = q.eq("class_id", selectedClass);
      const { data } = await q;
      return data || [];
    },
  });

  const total = attendance.length;
  const present = attendance.filter((a: any) => a.status === "present").length;
  const absent = attendance.filter((a: any) => a.status === "absent").length;
  const late = attendance.filter((a: any) => a.status === "late").length;
  const pctPresent = total > 0 ? Math.round((present / total) * 100) : 0;

  // Group by student
  const studentMap = new Map<string, { name: string; present: number; absent: number; late: number; total: number }>();
  attendance.forEach((a: any) => {
    const name = (a as any).students?.full_name || "Unknown";
    const key = a.student_id;
    if (!studentMap.has(key)) studentMap.set(key, { name, present: 0, absent: 0, late: 0, total: 0 });
    const rec = studentMap.get(key)!;
    rec.total++;
    if (a.status === "present") rec.present++;
    else if (a.status === "absent") rec.absent++;
    else if (a.status === "late") rec.late++;
  });

  const studentStats = Array.from(studentMap.entries()).map(([id, data]) => ({
    id, ...data, pct: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
  })).sort((a, b) => a.pct - b.pct);

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Attendance Reports</h1><p className="text-muted-foreground text-sm mt-1">Analytics and detailed attendance reports</p></div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter Class" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Classes</SelectItem>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
          </Select>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Present", value: present, icon: UserCheck, color: "text-emerald-600" },
            { label: "Absent", value: absent, icon: UserX, color: "text-destructive" },
            { label: "Late", value: late, icon: Clock, color: "text-amber-600" },
            { label: "Attendance %", value: `${pctPresent}%`, icon: TrendingUp, color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Student-wise Attendance (Low to High)</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Student</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Late</TableHead><TableHead>Total Days</TableHead><TableHead>Attendance %</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {studentStats.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">{s.present}</TableCell>
                    <TableCell className="text-destructive font-medium">{s.absent}</TableCell>
                    <TableCell className="text-amber-600 font-medium">{s.late}</TableCell>
                    <TableCell>{s.total}</TableCell>
                    <TableCell>
                      <Badge variant={s.pct >= 75 ? "default" : "destructive"}>{s.pct}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {studentStats.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No attendance data</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceReports;
