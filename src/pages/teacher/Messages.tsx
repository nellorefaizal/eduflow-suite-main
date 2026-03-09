import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeacherMessages = () => {
  const { data: notices = [] } = useQuery({
    queryKey: ["teacher-msgs"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").order("published_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1">School-wide communications</p>
        </div>
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="p-5 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5 text-info" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(n.published_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {notices.length === 0 && <div className="text-center py-12 text-muted-foreground">No messages</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherMessages;