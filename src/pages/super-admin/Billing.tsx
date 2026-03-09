import { motion } from "framer-motion";
import { Wallet, CreditCard, FileText, AlertTriangle, CheckCircle2, Clock, IndianRupee } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusStyles: Record<string, { icon: typeof CheckCircle2; class: string }> = {
  completed: { icon: CheckCircle2, class: "text-success bg-success/10" },
  pending: { icon: Clock, class: "text-warning bg-warning/10" },
  failed: { icon: AlertTriangle, class: "text-destructive bg-destructive/10" },
};

const SuperAdminBilling = () => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["billing-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("billing_transactions").select("*, schools(name)").order("billing_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = transactions.reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const thisMonth = transactions.filter(t => new Date(t.billing_date).getMonth() === new Date().getMonth()).reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const pending = transactions.filter(t => t.status === "pending").reduce((s, t) => s + Number(t.total_amount || 0), 0);
  const failed = transactions.filter(t => t.status === "failed").reduce((s, t) => s + Number(t.total_amount || 0), 0);

  const stats = [
    { label: "Total Revenue", value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: Wallet },
    { label: "This Month", value: `₹${(thisMonth / 100000).toFixed(1)}L`, icon: CreditCard },
    { label: "Pending", value: `₹${(pending / 1000).toFixed(0)}K`, icon: FileText },
    { label: "Failed", value: `₹${(failed / 1000).toFixed(0)}K`, icon: AlertTriangle },
  ];

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Transactions</h1>
          <p className="text-muted-foreground mt-1">View all platform-wide transactions</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <s.icon className="w-5 h-5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h3 className="font-semibold text-foreground">All Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Invoice</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">School</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">GST</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Total</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? [1,2,3].map(i => <tr key={i}><td colSpan={7} className="py-4 px-5"><div className="h-6 bg-muted animate-pulse rounded" /></td></tr>)
                : transactions.map(t => {
                  const st = statusStyles[t.status] || statusStyles.completed;
                  return (
                    <tr key={t.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs text-foreground">{t.invoice_no || "—"}</td>
                      <td className="py-3.5 px-5 font-medium text-foreground">{(t as any).schools?.name || "—"}</td>
                      <td className="py-3.5 px-5 text-foreground">₹{Number(t.amount).toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-muted-foreground">₹{Number(t.gst_amount).toLocaleString()}</td>
                      <td className="py-3.5 px-5 font-semibold text-foreground">₹{Number(t.total_amount).toLocaleString()}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.class}`}>
                          <st.icon className="w-3.5 h-3.5" /> {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground">{new Date(t.billing_date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {!isLoading && transactions.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No transactions yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminBilling;
