import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BarChart3, Users, GraduationCap, CreditCard, CalendarDays, School, TrendingUp, ClipboardList } from "lucide-react";

const Reports = () => {
  const { data: stats } = useQuery({
    queryKey: ["school-report-stats"],
    queryFn: async () => {
      const [students, teachers, classes, exams, attendance, payments] = await Promise.all([
        supabase.from("students").select("id, status, gender", { count: "exact" }),
        supabase.from("teachers").select("id, status", { count: "exact" }),
        supabase.from("classes").select("id", { count: "exact" }),
        supabase.from("exams").select("id, status", { count: "exact" }),
        supabase.from("attendance").select("id, status"),
        supabase.from("fee_payments").select("amount, status"),
      ]);

      const activeStudents = students.data?.filter(s => s.status === "active").length || 0;
      const activeTeachers = teachers.data?.filter(t => t.status === "active").length || 0;
      const presentCount = attendance.data?.filter(a => a.status === "present").length || 0;
      const totalAttendance = attendance.data?.length || 0;
      const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
      const totalCollected = payments.data?.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0) || 0;
      const boys = students.data?.filter(s => s.gender === "Male").length || 0;
      const girls = students.data?.filter(s => s.gender === "Female").length || 0;

      return {
        totalStudents: students.count || 0, activeStudents, boys, girls,
        totalTeachers: teachers.count || 0, activeTeachers,
        totalClasses: classes.count || 0,
        totalExams: exams.count || 0, completedExams: exams.data?.filter(e => e.status === "completed").length || 0,
        attendancePct, totalCollected,
      };
    },
  });

  const reportCards = [
    { title: "Student Report", desc: `${stats?.activeStudents || 0} active students (${stats?.boys || 0} boys, ${stats?.girls || 0} girls)`, icon: Users, value: stats?.totalStudents || 0, color: "from-blue-500 to-blue-600" },
    { title: "Staff Report", desc: `${stats?.activeTeachers || 0} active teachers`, icon: School, value: stats?.totalTeachers || 0, color: "from-violet-500 to-violet-600" },
    { title: "Academic Report", desc: `${stats?.totalClasses || 0} classes configured`, icon: GraduationCap, value: stats?.totalClasses || 0, color: "from-emerald-500 to-emerald-600" },
    { title: "Exam Report", desc: `${stats?.completedExams || 0} of ${stats?.totalExams || 0} exams completed`, icon: ClipboardList, value: stats?.totalExams || 0, color: "from-amber-500 to-amber-600" },
    { title: "Attendance Report", desc: `Overall ${stats?.attendancePct || 0}% attendance rate`, icon: CalendarDays, value: `${stats?.attendancePct || 0}%`, color: "from-cyan-500 to-cyan-600" },
    { title: "Financial Report", desc: `₹${(stats?.totalCollected || 0).toLocaleString()} total collected`, icon: CreditCard, value: `₹${((stats?.totalCollected || 0) / 1000).toFixed(0)}K`, color: "from-rose-500 to-rose-600" },
  ];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive school performance overview</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-all overflow-hidden">
                <div className={`bg-gradient-to-r ${r.color} p-4`}>
                  <div className="flex items-center justify-between text-white">
                    <r.icon className="w-8 h-8 opacity-80" />
                    <div className="text-3xl font-bold font-display">{r.value}</div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display font-bold text-base">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Quick Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Gender Distribution</h4>
                <div className="flex gap-2">
                  <Badge>Boys: {stats?.boys || 0}</Badge>
                  <Badge variant="secondary">Girls: {stats?.girls || 0}</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium text-sm mb-2">Teacher-Student Ratio</h4>
                <div className="text-2xl font-bold font-display">
                  1:{stats?.activeTeachers ? Math.round((stats?.activeStudents || 0) / stats.activeTeachers) : "—"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
