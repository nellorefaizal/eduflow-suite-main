import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Users, Search, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const actionColors: Record<string, string> = {
  login: "text-success bg-success/10",
  logout: "text-muted-foreground bg-muted",
  create: "text-info bg-info/10",
  update: "text-warning bg-warning/10",
  delete: "text-destructive bg-destructive/10",
};

const SuperAdminAuditLogs = () => {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_id?.toLowerCase().includes(search.toLowerCase())
  );

  const loginEvents = logs.filter(l => l.action === "login").length;
  const dataChanges = logs.filter(l => ["create", "update", "delete"].includes(l.action)).length;
  const securityAlerts = logs.filter(l => l.action.includes("security") || l.action.includes("failed")).length;

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all platform activities, logins, and data changes</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Login Events", value: loginEvents, icon: Users, color: "bg-info/10 text-info" },
            { label: "Data Changes", value: dataChanges, icon: FileText, color: "bg-warning/10 text-warning" },
            { label: "Security Alerts", value: securityAlerts, icon: Shield, color: "bg-destructive/10 text-destructive" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Timestamp</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Action</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Entity</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">IP Address</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? [1,2,3].map(i => <tr key={i}><td colSpan={5} className="py-4 px-5"><div className="h-6 bg-muted animate-pulse rounded" /></td></tr>)
                : filtered.map(log => (
                  <tr key={log.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-5 text-muted-foreground font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || "text-muted-foreground bg-muted"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-foreground">{log.entity_type || "—"} {log.entity_id ? `#${log.entity_id.slice(0,8)}` : ""}</td>
                    <td className="py-3.5 px-5 text-muted-foreground font-mono text-xs">{log.ip_address || "—"}</td>
                    <td className="py-3.5 px-5 text-muted-foreground text-xs max-w-[200px] truncate">{log.details ? JSON.stringify(log.details) : "—"}</td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No audit logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminAuditLogs;
