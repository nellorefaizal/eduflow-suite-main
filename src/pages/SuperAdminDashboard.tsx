import { motion } from "framer-motion";
import { Building2, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, School, AlertTriangle, CheckCircle2, Clock, Activity, Globe, Shield } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000 }, { month: "Feb", revenue: 52000 }, { month: "Mar", revenue: 61000 },
  { month: "Apr", revenue: 58000 }, { month: "May", revenue: 72000 }, { month: "Jun", revenue: 82400 },
];

const planDistribution = [
  { name: "Enterprise", value: 55, color: "hsl(40, 96%, 53%)" },
  { name: "Professional", value: 34, color: "hsl(210, 100%, 52%)" },
  { name: "Starter", value: 11, color: "hsl(152, 60%, 42%)" },
];

const SuperAdminDashboard = () => {
  const { profile } = useAuth();

  const { data: schools } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: billingData } = useQuery({
    queryKey: ["billing-summary"],
    queryFn: async () => {
      const { data } = await supabase.from("billing_transactions").select("*").order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const totalSchools = schools?.length || 0;
  const activeSchools = schools?.filter(s => s.status === "active").length || 0;
  const totalStudents = schools?.reduce((sum, s) => sum + (s.student_count || 0), 0) || 0;
  const totalRevenue = billingData?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;

  const stats = [
    { label: "Total Schools", value: totalSchools.toString(), change: "+12", up: true, icon: Building2, color: "bg-accent/10 text-accent" },
    { label: "Active Students", value: totalStudents > 0 ? totalStudents.toLocaleString() : "0", change: "+8.2%", up: true, icon: Users, color: "bg-info/10 text-info" },
    { label: "Monthly Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, change: "+15.3%", up: true, icon: CreditCard, color: "bg-success/10 text-success" },
    { label: "Churn Rate", value: "2.1%", change: "-0.4%", up: false, icon: TrendingUp, color: "bg-warning/10 text-warning" },
  ];

  const statusStyles: Record<string, { icon: typeof CheckCircle2; class: string }> = {
    active: { icon: CheckCircle2, class: "text-success bg-success/10" },
    trial: { icon: Clock, class: "text-warning bg-warning/10" },
    pending: { icon: AlertTriangle, class: "text-destructive bg-destructive/10" },
    suspended: { icon: AlertTriangle, class: "text-destructive bg-destructive/10" },
  };

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Platform Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name || "Super Admin"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <Activity className="w-3 h-3" /> System Online
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <Globe className="w-3 h-3" /> v2.4.0
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${stat.up ? "text-success" : "text-destructive"}`}>
                  {stat.change}
                  {stat.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                </span>
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-3 p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(40, 96%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(40, 96%, 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="month" stroke="hsl(215, 12%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(215, 12%, 50%)" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(40, 96%, 53%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-2 p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-4 font-display">Plan Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {planDistribution.map(p => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-xs text-muted-foreground">{p.name} ({p.value}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Schools Table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-card shadow-card border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground font-display">Registered Schools</h3>
            <span className="text-sm text-accent font-medium cursor-pointer hover:underline">View All</span>
          </div>
          {schools && schools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 text-muted-foreground font-medium">School</th>
                    <th className="text-left py-3 text-muted-foreground font-medium hidden sm:table-cell">Plan</th>
                    <th className="text-left py-3 text-muted-foreground font-medium hidden md:table-cell">Students</th>
                    <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.slice(0, 5).map((school) => {
                    const st = statusStyles[school.status] || statusStyles.active;
                    return (
                      <tr key={school.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-medium text-foreground flex items-center gap-2">
                          <School className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{school.name}</span>
                        </td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell capitalize">{school.plan}</td>
                        <td className="py-3 text-muted-foreground hidden md:table-cell">{school.student_count.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.class}`}>
                            <st.icon className="w-3.5 h-3.5" />
                            {school.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="font-medium">No schools registered yet</p>
              <p className="text-sm mt-1">Schools will appear here once they sign up</p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
