import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";

const Exams = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", exam_type: "mid_term", start_date: "", end_date: "" });

  const { data: exams = [], refetch } = useQuery({
    queryKey: ["exams"], queryFn: async () => { const { data } = await supabase.from("exams").select("*, academic_years(name)").order("created_at", { ascending: false }); return data || []; },
  });

  const handleAdd = async () => {
    if (!form.name) return toast.error("Exam name is required");
    const school = exams[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("exams").insert({ ...form, school_id: school, start_date: form.start_date || null, end_date: form.end_date || null });
    if (error) return toast.error(error.message);
    toast.success("Exam created"); setAddOpen(false); setForm({ name: "", exam_type: "mid_term", start_date: "", end_date: "" }); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam and all its results?")) return;
    await supabase.from("exam_results").delete().eq("exam_id", id);
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Exam deleted"); refetch();
  };

  const statusColor: Record<string, string> = { completed: "bg-emerald-500", scheduled: "bg-primary", ongoing: "bg-amber-500" };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Exam Management</h1><p className="text-muted-foreground text-sm mt-1">Create and manage examinations</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Create Exam</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Examination</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Exam Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Mid-Term 2026" /></div>
                <div><Label>Type</Label>
                  <Select value={form.exam_type} onValueChange={v => setForm(p => ({ ...p, exam_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="unit_test">Unit Test</SelectItem><SelectItem value="mid_term">Mid Term</SelectItem><SelectItem value="final">Final</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                  <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Create Exam</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Exams", value: exams.length, icon: ClipboardList },
            { label: "Completed", value: exams.filter((e: any) => e.status === "completed").length, icon: CheckCircle2 },
            { label: "Upcoming", value: exams.filter((e: any) => e.status === "scheduled").length, icon: Clock },
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
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Exam Name</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {exams.map((e: any) => (
                  <TableRow key={e.id} className="hover:bg-muted/30">
                    <TableCell><div className="font-medium">{e.name}</div><div className="text-xs text-muted-foreground">{(e as any).academic_years?.name || ""}</div></TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{e.exam_type.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-sm">{e.start_date || "TBD"} → {e.end_date || "TBD"}</TableCell>
                    <TableCell><Badge className={`${statusColor[e.status] || "bg-muted"} text-white border-0`}>{e.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No exams created yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Exams;
