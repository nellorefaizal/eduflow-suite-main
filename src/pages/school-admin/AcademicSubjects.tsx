import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookMarked, Plus, Trash2, Search } from "lucide-react";

const AcademicSubjects = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const { data: subjects = [], refetch } = useQuery({
    queryKey: ["subjects"], queryFn: async () => { const { data } = await supabase.from("subjects").select("*").order("name"); return data || []; },
  });

  const filtered = subjects.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async () => {
    if (!form.name) return toast.error("Subject name required");
    const school = subjects[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("subjects").insert({ ...form, school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Subject added"); setAddOpen(false); setForm({ name: "", code: "", description: "" }); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Subjects</h1><p className="text-muted-foreground text-sm mt-1">Manage academic subjects</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Subject</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Subject Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Code</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. MATH" /></div>
                <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Subject</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Card className="shadow-card">
          <div className="p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Subject</TableHead><TableHead>Code</TableHead><TableHead className="hidden md:table-cell">Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BookMarked className="w-4 h-4 text-primary" /></div><span className="font-medium">{s.name}</span></div></TableCell>
                    <TableCell><Badge variant="outline">{s.code || "—"}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.description || "—"}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AcademicSubjects;
