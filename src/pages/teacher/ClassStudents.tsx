import { motion } from "framer-motion";
import { Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TeacherClassStudents = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState("");

  const { data: teacherData } = useQuery({
    queryKey: ["t-cs-info", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("teachers").select("school_id").eq("user_id", user?.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["t-cs-classes", teacherData?.school_id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name, section").eq("school_id", teacherData!.school_id);
      return data || [];
    },
    enabled: !!teacherData?.school_id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["class-students", selectedClass],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*").eq("class_id", selectedClass).eq("status", "active").order("roll_no");
      return data || [];
    },
    enabled: !!selectedClass,
  });

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Class Students</h1>
          <p className="text-muted-foreground mt-1">View students in your classes</p>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
        </Select>
        {selectedClass && students.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Roll</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Gender</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Guardian</th>
                <th className="text-left py-3 px-5 text-muted-foreground font-medium">Phone</th>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                    <td className="py-3 px-5 text-muted-foreground font-mono">{s.roll_no || "—"}</td>
                    <td className="py-3 px-5 font-medium text-foreground">{s.full_name}</td>
                    <td className="py-3 px-5 text-muted-foreground capitalize">{s.gender || "—"}</td>
                    <td className="py-3 px-5 text-muted-foreground">{s.guardian_name || "—"}</td>
                    <td className="py-3 px-5 text-muted-foreground">{s.phone || s.guardian_phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        {selectedClass && students.length === 0 && <div className="text-center py-12 text-muted-foreground">No students</div>}
        {!selectedClass && <div className="text-center py-12 text-muted-foreground"><Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" /><p>Select a class</p></div>}
      </div>
    </DashboardLayout>
  );
};

export default TeacherClassStudents;