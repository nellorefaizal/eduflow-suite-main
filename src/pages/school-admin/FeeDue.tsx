import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, IndianRupee } from "lucide-react";

const FeeDue = () => {
  const { data: students = [] } = useQuery({
    queryKey: ["students-fee-due"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, classes(name, section)").eq("status", "active").order("full_name");
      return data || [];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["all-payments-due"],
    queryFn: async () => {
      const { data } = await supabase.from("fee_payments").select("student_id, amount, status");
      return data || [];
    },
  });

  const { data: structures = [] } = useQuery({
    queryKey: ["fee-structures-due"],
    queryFn: async () => {
      const { data } = await supabase.from("fee_structures").select("*");
      return data || [];
    },
  });

  const totalFeePerStudent = structures.reduce((s: number, f: any) => s + f.amount, 0);

  const studentDues = students.map((s: any) => {
    const paid = payments.filter((p: any) => p.student_id === s.id && p.status === "completed").reduce((sum: number, p: any) => sum + p.amount, 0);
    const due = Math.max(0, totalFeePerStudent - paid);
    return { ...s, paid, due };
  }).filter(s => s.due > 0).sort((a, b) => b.due - a.due);

  const totalDue = studentDues.reduce((s, d) => s + d.due, 0);

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Fee Due Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Students with pending fee payments</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Students with Dues", value: studentDues.length, icon: AlertTriangle, color: "text-amber-600" },
            { label: "Total Due", value: `₹${totalDue.toLocaleString()}`, icon: IndianRupee, color: "text-destructive" },
            { label: "Fee Per Student", value: `₹${totalFeePerStudent.toLocaleString()}`, icon: FileText, color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Students with Pending Fees</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Total Fee</TableHead><TableHead>Paid</TableHead><TableHead>Due</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {studentDues.map(s => (
                  <TableRow key={s.id}>
                    <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-bold text-destructive">{s.full_name.charAt(0)}</div><div><div className="font-medium text-sm">{s.full_name}</div><div className="text-xs text-muted-foreground">{s.admission_no}</div></div></div></TableCell>
                    <TableCell><Badge variant="outline">{(s as any).classes?.name} {(s as any).classes?.section}</Badge></TableCell>
                    <TableCell className="text-sm">₹{totalFeePerStudent.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-emerald-600 font-medium">₹{s.paid.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="destructive">₹{s.due.toLocaleString()}</Badge></TableCell>
                  </TableRow>
                ))}
                {studentDues.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No pending dues found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeeDue;
