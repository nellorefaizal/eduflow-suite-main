import { motion } from "framer-motion";
import { Users, GraduationCap, CreditCard, CalendarDays, ArrowUpRight, BookOpen, Bell, Clock, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const attendanceData = [
  { day: "Mon", present: 92, absent: 8 }, { day: "Tue", present: 95, absent: 5 },
  { day: "Wed", present: 88, absent: 12 }, { day: "Thu", present: 91, absent: 9 },
  { day: "Fri", present: 94, absent: 6 },
];

const SchoolAdminDashboard = () => {
  const { profile } = useAuth();

  const { data: students } = useQuery({
    queryKey: ["school-students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").limit(100);
      return data || [];
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["school-teachers"],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("*").limit(100);
      return data || [];
    },
  });

  const { data: feePayments } = useQuery({
    queryKey: ["school-fees"],
    queryFn: async () => {
      const { data } = await supabase.from("fee_payments").select("*").limit(100);
      return data || [];
    },
  });

  const totalStudents = students?.length || 0;
  const totalTeachers = teachers?.length || 0;
  const totalFees = feePayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  const stats = [
    { label: "Total Students", value: totalStudents.toLocaleString(), change: "+23", up: true, icon: Users, color: "bg-info/10 text-info" },
    { label: "Teachers", value: totalTeachers.toString(), change: "+3", up: true, icon: GraduationCap, color: "bg-accent/10 text-accent" },
    { label: "Fee Collection", value: `₹${(totalFees / 100000).toFixed(1)}L`, change: "87%", up: true, icon: CreditCard, color: "bg-success/10 text-success" },
    { label: "Attendance Today", value: "92.4%", change: "+1.2%", up: true, icon: CalendarDays, color: "bg-warning/10 text-warning" },
  ];

  const recentActivity = [
    { text: "Class X-A attendance marked", time: "2 min ago", icon: CalendarDays },
    { text: "Fee payment received — Rahul Sharma", time: "15 min ago", icon: CreditCard },
    { text: "Math exam results uploaded", time: "1 hr ago", icon: BookOpen },
    { text: "New student admitted — Priya Gupta", time: "3 hr ago", icon: Users },
    { text: "Parent-teacher meeting scheduled", time: "5 hr ago", icon: Bell },
  ];

  return (
    <DashboardLayout role="school-admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">School Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {profile?.full_name || "Admin"} — Academic Year 2025-26</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  {stat.change} <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Attendance Chart */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Weekly Attendance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="day" stroke="hsl(215, 12%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="present" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-2 p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <activity.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { label: "Upcoming Exams", value: "3", sub: "This month", icon: BookOpen },
            { label: "Pending Fees", value: "₹2.8L", sub: "43 students", icon: CreditCard },
            { label: "Unread Notices", value: "7", sub: "Last 7 days", icon: Bell },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground/70">{item.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SchoolAdminDashboard;
