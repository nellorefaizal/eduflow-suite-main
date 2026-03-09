import { motion } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TeacherAnnouncements = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const qc = useQueryClient();

  const { data: teacherData } = useQuery({
    queryKey: ["t-ann-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").order("published_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notices").insert([{
        title: form.title, content: form.content, school_id: teacherData?.school_id || null,
        published_by: user?.id, target_role: "student",
      }]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notices"] }); setOpen(false); toast.success("Announcement posted"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground mt-1">Post and view announcements</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> New</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} /></div>
                <Button className="w-full" onClick={() => addMutation.mutate()} disabled={!form.title || !form.content || addMutation.isPending}>Post</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {isLoading ? [1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />) :
          notices.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(n.published_at).toLocaleDateString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
          {!isLoading && notices.length === 0 && <div className="text-center py-12 text-muted-foreground">No announcements</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherAnnouncements;