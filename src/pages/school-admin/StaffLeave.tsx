import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const StaffLeave = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  const { data: leaves = [], refetch } = useQuery({
    queryKey: ["leave-requests", statusFilter],
    queryFn: async () => {
      let q = supabase.from("leave_requests").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const handleAction = async (id: string, status: string) => {
    const { error } = await supabase.from("leave_requests").update({ status, approved_by: user?.id }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Leave ${status}`);
    refetch();
  };

  const pending = leaves.filter((l: any) => l.status === "pending").length;
  const approved = leaves.filter((l: any) => l.status === "approved").length;
  const rejected = leaves.filter((l: any) => l.status === "rejected").length;

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Leave Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Approve and track staff leave requests</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending", value: pending, icon: Clock, color: "text-amber-600" },
            { label: "Approved", value: approved, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Rejected", value: rejected, icon: XCircle, color: "text-destructive" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <div className="p-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Staff</TableHead><TableHead>Type</TableHead><TableHead>Period</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {leaves.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium text-sm">{(l as any).profiles?.full_name || "Unknown"}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{l.leave_type}</Badge></TableCell>
                    <TableCell className="text-sm">{l.start_date} → {l.end_date}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-48 truncate">{l.reason || "—"}</TableCell>
                    <TableCell><Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"}>{l.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {l.status === "pending" && (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleAction(l.id, "approved")}>Approve</Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleAction(l.id, "rejected")}>Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No leave requests</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffLeave;
