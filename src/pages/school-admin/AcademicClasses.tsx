import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2 } from "lucide-react";

const AcademicClasses = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", section: "", capacity: "40" });

  const { data: classes = [], refetch } = useQuery({
    queryKey: ["classes-detail"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*, academic_years(name)").order("name");
      return data || [];
    },
  });

  const { data: studentCounts = [] } = useQuery({
    queryKey: ["student-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("class_id").eq("status", "active");
      return data || [];
    },
  });

  const getStudentCount = (classId: string) => studentCounts.filter((s: any) => s.class_id === classId).length;

  const handleAdd = async () => {
    if (!form.name) return toast.error("Class name required");
    const school = classes[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("classes").insert({ name: form.name, section: form.section || null, capacity: Number(form.capacity), school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Class created"); setAddOpen(false); setForm({ name: "", section: "", capacity: "40" }); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Class deleted"); refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Classes & Sections</h1><p className="text-muted-foreground text-sm mt-1">Manage classroom structure</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Class</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Class Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Class 1" /></div>
                <div><Label>Section</Label><Input value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} placeholder="e.g. A" /></div>
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Create Class</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((c: any, i: number) => {
            const count = getStudentCount(c.id);
            const pct = Math.round((count / c.capacity) * 100);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-primary/10"><BookOpen className="w-5 h-5 text-primary" /></div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                    <h3 className="font-display font-bold text-lg">{c.name} {c.section && `— ${c.section}`}</h3>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Students</span><span className="font-medium">{count}/{c.capacity}</span></div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">{(c as any).academic_years?.name || "Current"}</Badge>
                      <Badge variant={pct > 90 ? "destructive" : "default"} className="text-xs">{pct}% full</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {classes.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No classes created yet.</CardContent></Card>}
      </div>
    </DashboardLayout>
  );
};

export default AcademicClasses;
