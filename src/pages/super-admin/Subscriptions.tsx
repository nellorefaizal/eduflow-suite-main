import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Clock, AlertTriangle, Plus } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusStyles: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  active: { icon: CheckCircle2, class: "text-success bg-success/10" },
  trial: { icon: Clock, class: "text-warning bg-warning/10" },
  overdue: { icon: AlertTriangle, class: "text-destructive bg-destructive/10" },
  suspended: { icon: AlertTriangle, class: "text-destructive bg-destructive/10" },
};

const SuperAdminSubscriptions = () => {
  const { data: plans = [] } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true });
      return data || [];
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ["schools-subs"],
    queryFn: async () => {
      const { data } = await supabase.from("schools").select("id, name, plan, status, student_count, created_at").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const planCounts = plans.map(p => ({
    plan: p.name,
    count: schools.filter(s => s.plan.toLowerCase() === p.name.toLowerCase()).length,
    revenue: `₹${Number(p.price).toLocaleString()}`,
    color: p.name === "Enterprise" ? "bg-accent" : p.name === "Professional" ? "bg-info" : "bg-success",
  }));

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage billing and subscription plans</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {planCounts.map((p, i) => (
            <motion.div key={p.plan} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${p.color}`} />
                <span className="font-semibold text-foreground">{p.plan}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{p.count} schools</div>
              <div className="text-sm text-muted-foreground mt-1">Price: {p.revenue}/mo</div>
            </motion.div>
          ))}
        </div>

        {/* Plans Detail */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-6 rounded-xl bg-card shadow-card border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Available Plans</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <h4 className="font-semibold text-foreground">{plan.name}</h4>
                <div className="text-2xl font-bold text-foreground mt-2">₹{Number(plan.price).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/{plan.billing_cycle}</span></div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div>Max Students: {plan.max_students}</div>
                  <div>Max Teachers: {plan.max_teachers}</div>
                  <div>Storage: {plan.max_storage_gb} GB</div>
                  <div>Trial: {plan.trial_days} days</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Schools Subscriptions */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50"><h3 className="font-semibold text-foreground">School Subscriptions</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">School</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Students</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Since</th>
                </tr>
              </thead>
              <tbody>
                {schools.map(s => {
                  const st = statusStyles[s.status] || statusStyles.active;
                  return (
                    <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-foreground">{s.name}</td>
                      <td className="py-3.5 px-5 text-muted-foreground capitalize">{s.plan}</td>
                      <td className="py-3.5 px-5 text-muted-foreground">{s.student_count}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.class}`}>
                          <st.icon className="w-3.5 h-3.5" /> {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminSubscriptions;
