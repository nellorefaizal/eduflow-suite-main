import { motion } from "framer-motion";
import { TrendingUp, Users, Building2, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const monthlyRevenue = [
  { month: "Sep", value: 62 },
  { month: "Oct", value: 68 },
  { month: "Nov", value: 71 },
  { month: "Dec", value: 74 },
  { month: "Jan", value: 78 },
  { month: "Feb", value: 82 },
];

const metrics = [
  { label: "Total Revenue (YTD)", value: "₹9.8Cr", change: "+32%", up: true, icon: CreditCard },
  { label: "New Schools (This Quarter)", value: "47", change: "+18%", up: true, icon: Building2 },
  { label: "Student Growth", value: "+124K", change: "+8.2%", up: true, icon: Users },
  { label: "Avg Revenue Per School", value: "₹15,080", change: "+5.1%", up: true, icon: TrendingUp },
];

const topSchools = [
  { name: "Delhi Public School, Noida", revenue: "₹6.0L", students: 3200 },
  { name: "Ryan International, Gurugram", revenue: "₹5.0L", students: 2800 },
  { name: "La Martiniere, Kolkata", revenue: "₹5.0L", students: 2400 },
  { name: "Kendriya Vidyalaya, Chennai", revenue: "₹1.3L", students: 1800 },
  { name: "DAV Public School, Lucknow", revenue: "₹1.3L", students: 1600 },
];

const regionData = [
  { region: "North India", schools: 210, pct: 38 },
  { region: "South India", schools: 145, pct: 27 },
  { region: "West India", schools: 112, pct: 20 },
  { region: "East India", schools: 80, pct: 15 },
];

const SuperAdminAnalytics = () => (
  <DashboardLayout role="super-admin">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform-wide performance metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl bg-card shadow-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <m.icon className="w-5 h-5 text-accent" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium ${m.up ? "text-success" : "text-destructive"}`}>
                {m.change}
                {m.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">{m.value}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{m.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl bg-card shadow-card border border-border/50"
        >
          <h3 className="font-semibold text-foreground mb-6">Monthly Revenue Trend (₹ Lakhs)</h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">{m.value}L</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.value / 90) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-t-lg gradient-accent min-h-[8px]"
                />
                <span className="text-xs text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Region Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-xl bg-card shadow-card border border-border/50"
        >
          <h3 className="font-semibold text-foreground mb-6">Regional Distribution</h3>
          <div className="space-y-5">
            {regionData.map((r) => (
              <div key={r.region}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{r.region}</span>
                  <span className="text-muted-foreground">{r.schools} schools ({r.pct}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Schools */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-xl bg-card shadow-card border border-border/50"
      >
        <h3 className="font-semibold text-foreground mb-4">Top Revenue Schools</h3>
        <div className="space-y-3">
          {topSchools.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="font-medium text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.students.toLocaleString()} students</div>
              </div>
              <div className="font-semibold text-foreground">{s.revenue}/mo</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </DashboardLayout>
);

export default SuperAdminAnalytics;
