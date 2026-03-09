import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
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

const TeacherAssignments = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", class_id: "", subject_id: "", due_date: "", total_marks: "100" });
  const qc = useQueryClient();

  const { data: teacherData } = useQuery({
    queryKey: ["teacher-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("id, school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["teacher-assignments", teacherData?.id],
    queryFn: async () => {
      const { data } = await supabase.from("assignments").select("*, classes(name, section), subjects(name)")
        .eq("school_id", teacherData!.school_id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["t-classes", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name, section").eq("school_id", teacherData!.school_id);
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["t-subjects", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("id, name").eq("school_id", teacherData!.school_id);
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert([{
        title: form.title, description: form.description, school_id: teacherData!.school_id,
        teacher_id: teacherData!.id, class_id: form.class_id || null, subject_id: form.subject_id || null,
        due_date: form.due_date || null, total_marks: Number(form.total_marks) || 100,
      }]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-assignments"] }); setOpen(false); toast.success("Assignment created"); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teacher-assignments"] }); toast.success("Deleted"); },
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground mt-1">Create and manage assignments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Create</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Class</Label>
                    <Select value={form.class_id} onValueChange={v => setForm(f => ({ ...f, class_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Subject</Label>
                    <Select value={form.subject_id} onValueChange={v => setForm(f => ({ ...f, subject_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                  <div><Label>Total Marks</Label><Input type="number" value={form.total_marks} onChange={e => setForm(f => ({ ...f, total_marks: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={() => addMutation.mutate()} disabled={!form.title || addMutation.isPending}>
                  {addMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div> : (
          <div className="space-y-3">
            {assignments.map((a: any, i: number) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-xl bg-card shadow-card border border-border/50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {a.classes && <span>{a.classes.name} {a.classes.section}</span>}
                    {a.subjects && <span>• {a.subjects.name}</span>}
                    {a.due_date && <span>• Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                    <span>• {a.total_marks} marks</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${a.status === "active" ? "text-success bg-success/10" : "text-muted-foreground bg-muted"}`}>
                  {a.status}
                </span>
                <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(a.id); }} className="p-2 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
            {assignments.length === 0 && <div className="text-center py-12 text-muted-foreground">No assignments yet. Create one!</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherAssignments;
