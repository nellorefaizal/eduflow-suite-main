import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wallet, IndianRupee, Users, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const StaffPayroll = () => {
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-payroll"],
    queryFn: async () => { const { data } = await supabase.from("teachers").select("*").eq("status", "active").order("full_name"); return data || []; },
  });

  const totalSalary = teachers.reduce((sum: number, t: any) => sum + (t.salary || 0), 0);
  const avgSalary = teachers.length > 0 ? Math.round(totalSalary / teachers.length) : 0;
  const currentMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Staff Payroll</h1><p className="text-muted-foreground text-sm mt-1">Salary processing for {currentMonth}</p></div>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export Payslips</Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Payroll", value: `₹${totalSalary.toLocaleString()}`, icon: IndianRupee },
            { label: "Employees", value: teachers.length, icon: Users },
            { label: "Avg Salary", value: `₹${avgSalary.toLocaleString()}`, icon: Wallet },
            { label: "Status", value: "Pending", icon: CheckCircle2 },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Salary Breakdown — {currentMonth}</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Employee</TableHead><TableHead>Subject</TableHead><TableHead>Basic Salary</TableHead><TableHead>Deductions</TableHead><TableHead>Net Pay</TableHead><TableHead>Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {teachers.map((t: any) => {
                  const deductions = Math.round((t.salary || 0) * 0.12);
                  const net = (t.salary || 0) - deductions;
                  return (
                    <TableRow key={t.id}>
                      <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.full_name.charAt(0)}</div><div><div className="font-medium text-sm">{t.full_name}</div><div className="text-xs text-muted-foreground">{t.email}</div></div></div></TableCell>
                      <TableCell className="text-sm">{t.subject_specialization || "—"}</TableCell>
                      <TableCell className="text-sm font-medium">₹{(t.salary || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-destructive">-₹{deductions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm font-bold text-emerald-600">₹{net.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {teachers.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No teachers found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffPayroll;
