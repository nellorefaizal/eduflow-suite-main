import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { School, Search, Plus, Trash2, Briefcase, IndianRupee, UserCheck } from "lucide-react";

const Teachers = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject_specialization: "", qualification: "", salary: "" });

  const { data: teachers = [], refetch } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => { const { data } = await supabase.from("teachers").select("*").order("full_name"); return data || []; },
  });

  const filtered = teachers.filter((t: any) => t.full_name.toLowerCase().includes(search.toLowerCase()) || t.subject_specialization?.toLowerCase().includes(search.toLowerCase()));
  const totalSalary = teachers.reduce((sum: number, t: any) => sum + (t.salary || 0), 0);

  const handleAdd = async () => {
    if (!form.full_name) return toast.error("Name is required");
    const school = teachers[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("teachers").insert({ ...form, salary: form.salary ? Number(form.salary) : null, school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Teacher added"); setAddOpen(false); setForm({ full_name: "", email: "", phone: "", subject_specialization: "", qualification: "", salary: "" }); refetch();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    const { error } = await supabase.from("teachers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`${name} removed`); refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Staff — Teachers</h1><p className="text-muted-foreground text-sm mt-1">Manage teaching staff</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Teacher</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Teacher</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="col-span-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Subject</Label><Input value={form.subject_specialization} onChange={e => setForm(p => ({ ...p, subject_specialization: e.target.value }))} /></div>
                <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} /></div>
                <div><Label>Salary (₹)</Label><Input type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Teacher</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Teachers", value: teachers.length, icon: School },
            { label: "Active", value: teachers.filter((t: any) => t.status === "active").length, icon: UserCheck },
            { label: "On Leave", value: teachers.filter((t: any) => t.status === "on_leave").length, icon: Briefcase },
            { label: "Monthly Payroll", value: `₹${(totalSalary / 1000).toFixed(0)}K`, icon: IndianRupee },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Name</TableHead><TableHead>Subject</TableHead><TableHead className="hidden md:table-cell">Qualification</TableHead><TableHead className="hidden lg:table-cell">Phone</TableHead><TableHead className="hidden md:table-cell">Salary</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((t: any) => (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.full_name.charAt(0)}</div><div><div className="font-medium text-sm">{t.full_name}</div><div className="text-xs text-muted-foreground">{t.email}</div></div></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{t.subject_specialization || "—"}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{t.qualification || "—"}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{t.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-medium">₹{(t.salary || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(t.id, t.full_name)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No teachers found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
