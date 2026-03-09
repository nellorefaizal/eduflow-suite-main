import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { CreditCard, Printer, Download } from "lucide-react";

const StudentIDCards = () => {
  const [selectedClass, setSelectedClass] = useState("all");

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"], queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-id", selectedClass],
    queryFn: async () => {
      let q = supabase.from("students").select("*, classes(name, section)").eq("status", "active").order("full_name");
      if (selectedClass !== "all") q = q.eq("class_id", selectedClass);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: school } = useQuery({
    queryKey: ["school-info"],
    queryFn: async () => { const { data } = await supabase.from("schools").select("*").limit(1).single(); return data; },
  });

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">ID Card Generator</h1>
            <p className="text-muted-foreground text-sm mt-1">Generate and print student ID cards</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter Class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print All</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-2">
          {students.map((s: any, i: number) => (
            <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="shadow-card overflow-hidden">
                <div className="bg-primary p-3 text-center">
                  <h3 className="text-primary-foreground font-display font-bold text-sm">{school?.name || "School Name"}</h3>
                  <p className="text-primary-foreground/70 text-[10px]">{school?.address}{school?.city && `, ${school.city}`}</p>
                </div>
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-primary">
                    {s.full_name.charAt(0)}
                  </div>
                  <h4 className="font-display font-bold text-base">{s.full_name}</h4>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Class:</span><span className="font-medium text-foreground">{(s as any).classes?.name} {(s as any).classes?.section}</span></div>
                    <div className="flex justify-between"><span>Roll No:</span><span className="font-medium text-foreground">{s.roll_no || "—"}</span></div>
                    <div className="flex justify-between"><span>Adm No:</span><span className="font-medium text-foreground">{s.admission_no || "—"}</span></div>
                    <div className="flex justify-between"><span>Blood:</span><span className="font-medium text-foreground">{s.blood_group || "—"}</span></div>
                  </div>
                  {s.guardian_phone && (
                    <div className="mt-2 pt-2 border-t text-[10px] text-muted-foreground">Emergency: {s.guardian_name} • {s.guardian_phone}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {students.length === 0 && <Card className="shadow-card"><CardContent className="p-12 text-center text-muted-foreground">No students found. Select a class or add students first.</CardContent></Card>}
      </div>
    </DashboardLayout>
  );
};

export default StudentIDCards;
