import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { CalendarDays, Award, ClipboardList, CreditCard, BookOpen, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const attendanceData = [{ name: "Attendance", value: 94.2, fill: "hsl(152, 60%, 42%)" }];

const stats = [
  { label: "Attendance", value: "94.2%", icon: CalendarDays, color: "bg-success/10 text-success" },
  { label: "Upcoming Exams", value: "3", icon: Award, color: "bg-warning/10 text-warning" },
  { label: "Assignments Due", value: "5", icon: ClipboardList, color: "bg-info/10 text-info" },
  { label: "Fee Status", value: "Paid", icon: CreditCard, color: "bg-accent/10 text-accent" },
];

const upcoming = [
  { title: "Mathematics Mid-Term", date: "Mar 15, 2026", icon: Award, type: "exam" },
  { title: "Physics Assignment Due", date: "Mar 10, 2026", icon: ClipboardList, type: "assignment" },
  { title: "Chemistry Lab Report", date: "Mar 12, 2026", icon: BookOpen, type: "assignment" },
  { title: "Parent-Teacher Meeting", date: "Mar 20, 2026", icon: Bell, type: "event" },
];

const typeColors: Record<string, string> = {
  exam: "bg-warning/10 text-warning",
  assignment: "bg-info/10 text-info",
  event: "bg-accent/10 text-accent",
};

const StudentDashboard = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Hello, {profile?.full_name || "Student"}! 👋</h1>
          <p className="text-muted-foreground mt-1">Class X-A — Academic Year 2025-26</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Upcoming</h3>
            <div className="space-y-3">
              {upcoming.map((item) => (
                <div key={item.title} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${typeColors[item.type]} flex items-center justify-center shrink-0`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Performance Overview</h3>
            <div className="space-y-4">
              {[
                { subject: "Mathematics", score: 92 },
                { subject: "Physics", score: 85 },
                { subject: "Chemistry", score: 78 },
                { subject: "English", score: 88 },
                { subject: "Computer Science", score: 95 },
              ].map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{s.subject}</span>
                    <span className="text-muted-foreground font-semibold">{s.score}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ delay: 0.5, duration: 0.8 }}
                      className={`h-full rounded-full ${s.score >= 90 ? "bg-success" : s.score >= 80 ? "bg-accent" : "bg-warning"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
