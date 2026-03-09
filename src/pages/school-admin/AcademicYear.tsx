import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Trash2, CheckCircle2, Star } from "lucide-react";

const AcademicYear = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const qc = useQueryClient();

  const { data: years = [], refetch } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data } = await supabase.from("academic_years").select("*").order("start_date", { ascending: false });
      return data || [];
    },
  });

  const handleAdd = async () => {
    if (!form.name || !form.start_date || !form.end_date) return toast.error("All fields are required");
    const school = years[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("academic_years").insert({ ...form, school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Academic year created");
    setAddOpen(false);
    setForm({ name: "", start_date: "", end_date: "" });
    refetch();
  };

  const handleSetCurrent = async (id: string) => {
    const school = years[0]?.school_id;
    if (!school) return;
    await supabase.from("academic_years").update({ is_current: false }).eq("school_id", school);
    await supabase.from("academic_years").update({ is_current: true }).eq("id", id);
    toast.success("Current academic year updated");
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this academic year?")) return;
    const { error } = await supabase.from("academic_years").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Academic Year Setup</h1>
            <p className="text-muted-foreground text-sm mt-1">Configure academic years, terms, and sessions</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Academic Year</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Academic Year</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Year Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. 2025-26" /></div>
                <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                <div><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Create</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {years.map((y: any, i: number) => (
            <motion.div key={y.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`shadow-card hover:shadow-card-hover transition-all ${y.is_current ? "ring-2 ring-primary" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-primary/10"><CalendarDays className="w-5 h-5 text-primary" /></div>
                    <div className="flex gap-1">
                      {!y.is_current && (
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => handleSetCurrent(y.id)}>
                          <Star className="w-3.5 h-3.5 mr-1" /> Set Current
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(y.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-lg">{y.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{y.start_date} → {y.end_date}</p>
                  <div className="mt-3">
                    {y.is_current ? (
                      <Badge className="bg-primary text-primary-foreground"><CheckCircle2 className="w-3 h-3 mr-1" /> Current Year</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {years.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No academic years configured yet.</CardContent></Card>}
      </div>
    </DashboardLayout>
  );
};

export default AcademicYear;
