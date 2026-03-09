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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2, CalendarDays } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CommNotices = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", target_role: "all" });
  const { user } = useAuth();

  const { data: notices = [], refetch } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").order("published_at", { ascending: false });
      return data || [];
    },
  });

  const handleAdd = async () => {
    if (!form.title || !form.content) return toast.error("Title and content required");
    const school = (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    const { error } = await supabase.from("notices").insert({
      title: form.title, content: form.content, published_by: user?.id,
      school_id: school, target_role: form.target_role === "all" ? null : form.target_role,
    });
    if (error) return toast.error(error.message);
    toast.success("Notice published"); setAddOpen(false); setForm({ title: "", content: "", target_role: "all" }); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Notice Board</h1><p className="text-muted-foreground text-sm mt-1">Create and manage school notices</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> New Notice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Notice</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Content *</Label><Textarea rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
                <div><Label>Target Audience</Label>
                  <Select value={form.target_role} onValueChange={v => setForm(p => ({ ...p, target_role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Everyone</SelectItem><SelectItem value="teacher">Teachers</SelectItem><SelectItem value="student">Students</SelectItem><SelectItem value="school_admin">Admins</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Publish Notice</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="space-y-4">
          {notices.map((n: any, i: number) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-bold text-base">{n.title}</h3>
                        {n.target_role && <Badge variant="outline" className="text-xs capitalize">{n.target_role}</Badge>}
                        {n.is_global && <Badge variant="secondary" className="text-xs">Global</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(n.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {notices.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No notices published yet</CardContent></Card>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommNotices;
