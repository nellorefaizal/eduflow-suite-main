import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const CommBroadcast = () => {
  const [form, setForm] = useState({ title: "", message: "", target: "all", channels: { sms: false, email: true, app: true } });
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["broadcast-stats"],
    queryFn: async () => {
      const [teachers, students] = await Promise.all([
        supabase.from("teachers").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return { teachers: teachers.count || 0, students: students.count || 0, total: (teachers.count || 0) + (students.count || 0) };
    },
  });

  const handleSend = async () => {
    if (!form.title || !form.message) return toast.error("Title and message required");
    // Save as a notice for now
    const school = (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    const { error } = await supabase.from("notices").insert({
      title: `[Broadcast] ${form.title}`, content: form.message, published_by: user?.id,
      school_id: school, target_role: form.target === "all" ? null : form.target, is_global: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Broadcast sent successfully!");
    setForm({ title: "", message: "", target: "all", channels: { sms: false, email: true, app: true } });
  };

  const getRecipientCount = () => {
    if (!stats) return 0;
    if (form.target === "teacher") return stats.teachers;
    if (form.target === "student") return stats.students;
    return stats.total;
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Broadcast Message</h1>
          <p className="text-muted-foreground text-sm mt-1">Send notifications to parents and staff</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Teachers", value: stats?.teachers || 0, icon: Users },
            { label: "Students", value: stats?.students || 0, icon: Users },
            { label: "Total Recipients", value: getRecipientCount(), icon: MessageSquare },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Compose Broadcast</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Subject *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Holiday Announcement" /></div>
            <div><Label>Message *</Label><Textarea rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Type your message..." /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Target Audience</Label>
                <Select value={form.target} onValueChange={v => setForm(p => ({ ...p, target: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">Everyone</SelectItem><SelectItem value="teacher">Teachers Only</SelectItem><SelectItem value="student">Students & Parents</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Channels</Label>
                <div className="flex gap-4 mt-2">
                  {(["email", "sms", "app"] as const).map(ch => (
                    <label key={ch} className="flex items-center gap-2 text-sm capitalize">
                      <Checkbox checked={form.channels[ch]} onCheckedChange={v => setForm(p => ({ ...p, channels: { ...p.channels, [ch]: !!v } }))} />
                      {ch === "app" ? "In-App" : ch.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">Sending to <Badge>{getRecipientCount()}</Badge> recipients</p>
              <Button onClick={handleSend} className="gap-2"><Send className="w-4 h-4" /> Send Broadcast</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CommBroadcast;
