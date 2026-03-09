import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Database, HardDrive, Users, IndianRupee, RefreshCw, Gauge, Table2,
  TrendingUp, Clock, Shield, Zap, AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageData {
  table_counts: { table: string; count: number }[];
  total_rows: number;
  auth_users: number;
  estimated_storage_gb: number;
  free_tier_limits: {
    database_rows: number;
    storage_gb: number;
    auth_users: number;
    edge_function_invocations: number;
    realtime_connections: number;
    bandwidth_gb: number;
  };
  usage_percentages: {
    database_rows: number;
    storage: number;
    auth_users: number;
  };
  remaining: {
    database_rows: number;
    storage_gb: number;
    auth_users: number;
  };
  estimated_monthly_cost_inr: number;
  fetched_at: string;
}

const REFRESH_INTERVAL = 30_000;

const tableIcons: Record<string, string> = {
  profiles: "👤", user_roles: "🛡️", schools: "🏫", students: "🎓",
  teachers: "👨‍🏫", classes: "📚", subjects: "📖", academic_years: "📅",
  attendance: "✅", assignments: "📝", assignment_submissions: "📤",
  exams: "📋", exam_results: "📊", fee_structures: "💰", fee_payments: "💳",
  timetable: "🕐", notices: "📢", leave_requests: "🏖️", support_tickets: "🎫",
  audit_logs: "📜", billing_transactions: "🧾", subscription_plans: "⭐",
};

const formatTableName = (name: string) =>
  name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const getStatusColor = (pct: number) => {
  if (pct < 50) return "text-emerald-500";
  if (pct < 80) return "text-amber-500";
  return "text-destructive";
};

const getProgressColor = (pct: number) => {
  if (pct < 50) return "bg-emerald-500";
  if (pct < 80) return "bg-amber-500";
  return "bg-destructive";
};

const Usage = () => {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(30);

  const fetchUsage = useCallback(async () => {
    try {
      setError(null);
      const { data: resp, error: err } = await supabase.functions.invoke("get-usage-metrics");
      if (err) throw err;
      setData(resp as UsageData);
      setLastRefresh(new Date());
      setCountdown(30);
    } catch (e: any) {
      setError(e.message || "Failed to fetch usage metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => Math.max(c - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const sortedTables = data?.table_counts
    ? [...data.table_counts].sort((a, b) => b.count - a.count)
    : [];

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Gauge className="w-7 h-7 text-primary" />
              Platform Usage
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time backend metrics — auto-refreshes every 30s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-xs font-mono">
              <Clock className="w-3 h-3" />
              Next refresh: {countdown}s
            </Badge>
            <button
              onClick={() => { setLoading(true); fetchUsage(); }}
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <span className="text-sm text-destructive">{error}</span>
          </motion.div>
        )}

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Database, label: "Total Rows", 
              value: data ? data.total_rows.toLocaleString("en-IN") : null,
              sub: data ? `${data.usage_percentages.database_rows.toFixed(1)}% of free tier` : null,
              pct: data?.usage_percentages.database_rows ?? 0,
            },
            {
              icon: HardDrive, label: "Est. Storage",
              value: data ? `${(data.estimated_storage_gb * 1024).toFixed(1)} MB` : null,
              sub: data ? `${data.usage_percentages.storage.toFixed(1)}% of ${data.free_tier_limits.storage_gb} GB` : null,
              pct: data?.usage_percentages.storage ?? 0,
            },
            {
              icon: Users, label: "Auth Users",
              value: data ? data.auth_users.toLocaleString("en-IN") : null,
              sub: data ? `${data.usage_percentages.auth_users.toFixed(1)}% of ${data.free_tier_limits.auth_users.toLocaleString("en-IN")}` : null,
              pct: data?.usage_percentages.auth_users ?? 0,
            },
            {
              icon: IndianRupee, label: "Est. Monthly Cost",
              value: data ? `₹${data.estimated_monthly_cost_inr.toLocaleString("en-IN")}` : null,
              sub: data?.estimated_monthly_cost_inr === 0 ? "Within free tier ✅" : "Exceeds free tier",
              pct: 0,
              isCost: true,
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-card border border-border/50 shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              </div>
              {card.value === null ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className={`text-2xl font-bold ${card.isCost && data?.estimated_monthly_cost_inr === 0 ? "text-emerald-600" : "text-foreground"}`}>
                  {card.value}
                </div>
              )}
              {card.sub === null ? (
                <Skeleton className="h-4 w-32 mt-1" />
              ) : (
                <div className={`text-xs mt-1 ${card.pct > 0 ? getStatusColor(card.pct) : "text-muted-foreground"}`}>
                  {card.sub}
                </div>
              )}
              {!card.isCost && card.pct >= 0 && (
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(card.pct, 100)}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${getProgressColor(card.pct)}`}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Free Tier Limits */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 rounded-xl bg-card border border-border/50 shadow-card"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-primary" />
            Free Tier Limits & Remaining Quota
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data && [
              { label: "Database Rows", used: data.total_rows, limit: data.free_tier_limits.database_rows, remaining: data.remaining.database_rows, unit: "" },
              { label: "Storage", used: data.estimated_storage_gb, limit: data.free_tier_limits.storage_gb, remaining: data.remaining.storage_gb, unit: " GB" },
              { label: "Auth Users", used: data.auth_users, limit: data.free_tier_limits.auth_users, remaining: data.remaining.auth_users, unit: "" },
              { label: "Edge Function Inv.", used: 0, limit: data.free_tier_limits.edge_function_invocations, remaining: data.free_tier_limits.edge_function_invocations, unit: "" },
              { label: "Realtime Conn.", used: 0, limit: data.free_tier_limits.realtime_connections, remaining: data.free_tier_limits.realtime_connections, unit: "" },
              { label: "Bandwidth", used: 0, limit: data.free_tier_limits.bandwidth_gb, remaining: data.free_tier_limits.bandwidth_gb, unit: " GB" },
            ].map((item) => {
              const pct = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
              return (
                <div key={item.label} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className={`text-xs font-mono ${getStatusColor(pct)}`}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressColor(pct)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Used: {typeof item.used === "number" && item.unit === " GB" ? item.used.toFixed(4) : item.used.toLocaleString("en-IN")}{item.unit}</span>
                    <span>Remaining: {typeof item.remaining === "number" && item.unit === " GB" ? item.remaining.toFixed(4) : item.remaining.toLocaleString("en-IN")}{item.unit}</span>
                  </div>
                </div>
              );
            })}
            {!data && Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </motion.div>

        {/* Per-Table Row Counts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl bg-card border border-border/50 shadow-card"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-5">
            <Table2 className="w-5 h-5 text-primary" />
            Per-Table Row Counts
          </h3>
          {sortedTables.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedTables.map((t, i) => {
                const maxCount = sortedTables[0]?.count || 1;
                const pct = maxCount > 0 ? (t.count / maxCount) * 100 : 0;
                return (
                  <motion.div
                    key={t.table}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{tableIcons[t.table] || "📦"}</span>
                      <span className="text-xs font-medium text-foreground truncate">
                        {formatTableName(t.table)}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {t.count.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + i * 0.03, duration: 0.6 }}
                        className="h-full rounded-full bg-primary/60"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="p-6 rounded-xl bg-card border border-border/50 shadow-card"
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            Cost Estimation (INR)
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">Free Tier Value</div>
              <div className="text-xl font-bold text-emerald-600">₹0/mo</div>
              <div className="text-xs text-muted-foreground mt-1">Current plan</div>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">If Over Free Tier</div>
              <div className="text-xl font-bold text-amber-600">
                ₹{data?.estimated_monthly_cost_inr.toLocaleString("en-IN") ?? "—"}
                <span className="text-xs font-normal">/mo</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Estimated extra cost</div>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <div className="text-xs text-muted-foreground mb-1">Last Refreshed</div>
              <div className="text-sm font-mono font-semibold text-foreground">
                {lastRefresh.toLocaleTimeString("en-IN")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lastRefresh.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Usage;
