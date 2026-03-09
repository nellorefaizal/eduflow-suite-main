import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";

const StudentPromote = () => {
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => { const { data } = await supabase.from("classes").select("*").order("name"); return data || []; },
  });

  const { data: students = [], refetch } = useQuery({
    queryKey: ["students-promote", fromClass],
    queryFn: async () => {
      if (!fromClass) return [];
      const { data } = await supabase.from("students").select("*").eq("class_id", fromClass).eq("status", "active").order("full_name");
      return data || [];
    },
    enabled: !!fromClass,
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selected.length === students.length) setSelected([]);
    else setSelected(students.map((s: any) => s.id));
  };

  const handlePromote = async () => {
    if (!toClass) return toast.error("Select target class");
    if (selected.length === 0) return toast.error("Select students to promote");
    if (fromClass === toClass) return toast.error("From and To class must be different");

    const { error } = await supabase.from("students").update({ class_id: toClass }).in("id", selected);
    if (error) return toast.error(error.message);
    toast.success(`${selected.length} students promoted successfully`);
    setSelected([]);
    refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Student Promotions</h1>
          <p className="text-muted-foreground text-sm mt-1">Promote students to the next class</p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Promotion Setup</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">From Class</label>
                <Select value={fromClass} onValueChange={v => { setFromClass(v); setSelected([]); }}>
                  <SelectTrigger><SelectValue placeholder="Select source class" /></SelectTrigger>
                  <SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground hidden sm:block mb-2" />
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">To Class</label>
                <Select value={toClass} onValueChange={setToClass}>
                  <SelectTrigger><SelectValue placeholder="Select target class" /></SelectTrigger>
                  <SelectContent>{classes.filter((c: any) => c.id !== fromClass).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handlePromote} disabled={selected.length === 0} className="gap-2">
                <Award className="w-4 h-4" /> Promote {selected.length > 0 && `(${selected.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {fromClass && (
          <Card className="shadow-card">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12"><Checkbox checked={selected.length === students.length && students.length > 0} onCheckedChange={selectAll} /></TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s: any) => (
                    <TableRow key={s.id} className={selected.includes(s.id) ? "bg-primary/5" : ""}>
                      <TableCell><Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggleSelect(s.id)} /></TableCell>
                      <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.full_name.charAt(0)}</div><span className="font-medium text-sm">{s.full_name}</span></div></TableCell>
                      <TableCell className="text-sm">{s.roll_no || "—"}</TableCell>
                      <TableCell className="text-sm">{s.admission_no || "—"}</TableCell>
                      <TableCell><Badge variant="default">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No students in this class</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentPromote;
