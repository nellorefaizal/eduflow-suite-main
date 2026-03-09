import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, BookOpen, Users } from "lucide-react";

const AcademicCurriculum = () => {
  const { data: classes = [] } = useQuery({
    queryKey: ["classes-curriculum"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*, academic_years(name)").order("name");
      return data || [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-curriculum"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      return data || [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-count-curriculum"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("class_id").eq("status", "active");
      return data || [];
    },
  });

  const getCount = (classId: string) => students.filter((s: any) => s.class_id === classId).length;

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Curriculum Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">View class-wise curriculum mapping</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Classes", value: classes.length, icon: BookOpen },
            { label: "Total Subjects", value: subjects.length, icon: FileText },
            { label: "Active Students", value: students.length, icon: Users },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {classes.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{c.name} {c.section && `— ${c.section}`}</span>
                    <Badge variant="outline">{getCount(c.id)} students</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((s: any) => (
                      <Badge key={s.id} variant="secondary" className="text-xs">{s.name} {s.code && `(${s.code})`}</Badge>
                    ))}
                  </div>
                  {subjects.length === 0 && <p className="text-xs text-muted-foreground">No subjects added yet</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {classes.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No classes created yet. Add classes first.</CardContent></Card>}
      </div>
    </DashboardLayout>
  );
};

export default AcademicCurriculum;
