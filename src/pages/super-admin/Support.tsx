import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, MessageSquare, Clock, CheckCircle2, AlertTriangle, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusStyles: Record<string, { class: string }> = {
  open: { class: "text-warning bg-warning/10" },
  in_progress: { class: "text-info bg-info/10" },
  resolved: { class: "text-success bg-success/10" },
  closed: { class: "text-muted-foreground bg-muted" },
};

const priorityStyles: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-warning",
  high: "text-destructive",
  urgent: "text-destructive font-bold",
};

const SuperAdminSupport = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const qc = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*, schools(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_tickets").update({ 
        status, 
        ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {})
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["support-tickets"] }); toast.success("Ticket updated"); },
  });

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedToday = tickets.filter(t => t.status === "resolved" && t.resolved_at && new Date(t.resolved_at).toDateString() === new Date().toDateString()).length;

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage support requests from schools</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Open Tickets", value: openCount, icon: Headphones, color: "text-warning bg-warning/10" },
            { label: "In Progress", value: inProgressCount, icon: Clock, color: "text-info bg-info/10" },
            { label: "Resolved Today", value: resolvedToday, icon: CheckCircle2, color: "text-success bg-success/10" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon className="w-5 h-5" /></div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {isLoading ? [1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />) :
          filtered.map((ticket, i) => (
            <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{(ticket as any).schools?.name || "Platform"}</span>
                    <span>·</span>
                    <span className={priorityStyles[ticket.priority]}>{ticket.priority}</span>
                    <span>·</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status]?.class || ""}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <Select value={ticket.status} onValueChange={v => updateMutation.mutate({ id: ticket.id, status: v })}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No tickets found</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminSupport;
