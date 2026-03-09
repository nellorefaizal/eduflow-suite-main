import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Plus, MoreVertical, CheckCircle2, Clock, AlertTriangle, MapPin, Users, Trash2, Edit } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig: Record<string, { icon: typeof CheckCircle2; class: string; label: string }> = {
  active: { icon: CheckCircle2, class: "text-success bg-success/10", label: "Active" },
  trial: { icon: Clock, class: "text-warning bg-warning/10", label: "Trial" },
  pending: { icon: AlertTriangle, class: "text-info bg-info/10", label: "Pending" },
  suspended: { icon: AlertTriangle, class: "text-destructive bg-destructive/10", label: "Suspended" },
};

const SuperAdminSchools = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", state: "", email: "", phone: "", plan: "starter" });
  const qc = useQueryClient();

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("schools").insert([{
        name: form.name, city: form.city, state: form.state, email: form.email, phone: form.phone, plan: form.plan,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schools"] }); setOpen(false); setForm({ name: "", city: "", state: "", email: "", phone: "", plan: "starter" }); toast.success("School added"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schools"] }); toast.success("School removed"); },
  });

  const filtered = schools.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schools</h1>
            <p className="text-muted-foreground mt-1">{schools.length} schools registered on the platform</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="lg"><Plus className="w-4 h-4 mr-2" /> Add School</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New School</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>School Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>City</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
                  <div><Label>State</Label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div><Label>Plan</Label>
                  <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => addMutation.mutate()} disabled={!form.name || addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add School"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search schools..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((school, i) => {
              const st = statusConfig[school.status] || statusConfig.active;
              return (
                <motion.div key={school.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="p-5 rounded-xl bg-card shadow-card border border-border/50 flex items-center gap-5 hover:shadow-card-hover transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{school.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                      {school.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {school.city}{school.state ? `, ${school.state}` : ""}</span>}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {school.student_count} students</span>
                      <span>{school.teacher_count} teachers</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.class}`}>
                      <st.icon className="w-3.5 h-3.5" /> {st.label}
                    </span>
                    <div className="text-xs text-muted-foreground capitalize">{school.plan}</div>
                  </div>
                  <button onClick={() => { if (confirm("Delete this school?")) deleteMutation.mutate(school.id); }}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              );
            })}
            {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground">No schools found</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminSchools;
