import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, PlusCircle, Send } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusStyles: Record<string, string> = {
  pending: "text-warning bg-warning/10",
  approved: "text-success bg-success/10",
  rejected: "text-destructive bg-destructive/10",
};

const TeacherLeave = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ start_date: "", end_date: "", leave_type: "casual", reason: "" });
  const qc = useQueryClient();

  const { data: teacherData } = useQuery({
    queryKey: ["teacher-leave-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["my-leaves", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("leave_requests").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leave_requests").insert([{
        user_id: user!.id, school_id: teacherData!.school_id,
        start_date: form.start_date, end_date: form.end_date, leave_type: form.leave_type, reason: form.reason,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-leaves"] }); setOpen(false); toast.success("Leave request submitted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Requests</h1>
            <p className="text-muted-foreground mt-1">Apply and track your leave</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="w-4 h-4 mr-2" /> Apply Leave</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                  <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
                </div>
                <div><Label>Type</Label>
                  <Select value={form.leave_type} onValueChange={v => setForm(f => ({ ...f, leave_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="earned">Earned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Reason</Label><Textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
                <Button className="w-full" onClick={() => addMutation.mutate()} disabled={!form.start_date || !form.end_date || addMutation.isPending}>
                  <Send className="w-4 h-4 mr-2" /> Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div> : (
          <div className="space-y-3">
            {leaves.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-xl bg-card shadow-card border border-border/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground capitalize">{l.leave_type} Leave</h3>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()}
                    {l.reason && ` · ${l.reason}`}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[l.status] || ""}`}>{l.status}</span>
              </motion.div>
            ))}
            {leaves.length === 0 && <div className="text-center py-12 text-muted-foreground">No leave requests</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherLeave;