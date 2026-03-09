import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { BookOpen, Users, CalendarDays, ClipboardList, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { week: "W1", avg: 72 }, { week: "W2", avg: 75 }, { week: "W3", avg: 78 },
  { week: "W4", avg: 74 }, { week: "W5", avg: 82 }, { week: "W6", avg: 85 },
];

const todayClasses = [
  { name: "Mathematics - X-A", time: "9:00 AM", room: "Room 12", status: "completed" },
  { name: "Physics - IX-B", time: "10:30 AM", room: "Lab 3", status: "in-progress" },
  { name: "Mathematics - X-B", time: "12:00 PM", room: "Room 14", status: "upcoming" },
  { name: "Physics - X-A", time: "2:00 PM", room: "Lab 3", status: "upcoming" },
];

const stats = [
  { label: "Today's Classes", value: "4", icon: BookOpen, color: "bg-accent/10 text-accent" },
  { label: "Pending Assignments", value: "12", icon: ClipboardList, color: "bg-warning/10 text-warning" },
  { label: "Students", value: "186", icon: Users, color: "bg-info/10 text-info" },
  { label: "Attendance Marked", value: "2/4", icon: CalendarDays, color: "bg-success/10 text-success" },
];

const statusMap: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
  completed: { icon: CheckCircle2, class: "text-success bg-success/10", label: "Done" },
  "in-progress": { icon: Clock, class: "text-accent bg-accent/10", label: "Now" },
  upcoming: { icon: AlertTriangle, class: "text-muted-foreground bg-muted", label: "Next" },
};

const TeacherDashboard = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Good Morning, {profile?.full_name || "Teacher"} 👋</h1>
          <p className="text-muted-foreground mt-1">Here's your schedule for today</p>
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
            <h3 className="font-semibold text-foreground mb-4 font-display">Today's Schedule</h3>
            <div className="space-y-3">
              {todayClasses.map((cls) => {
                const st = statusMap[cls.status];
                return (
                  <div key={cls.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{cls.name}</div>
                        <div className="text-xs text-muted-foreground">{cls.time} • {cls.room}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.class}`}>
                      <st.icon className="w-3 h-3" /> {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Class Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="week" stroke="hsl(215, 12%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="hsl(40, 96%, 53%)" strokeWidth={2} dot={{ fill: "hsl(40, 96%, 53%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
