import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Wallet, Plus, Search, IndianRupee, TrendingUp } from "lucide-react";

const FeePayments = () => {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", amount: "", payment_method: "cash" });

  const { data: payments = [], refetch } = useQuery({
    queryKey: ["fee-payments-all"],
    queryFn: async () => {
      const { data } = await supabase.from("fee_payments").select("*, students(full_name, admission_no)").order("payment_date", { ascending: false });
      return data || [];
    },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-fee"],
    queryFn: async () => { const { data } = await supabase.from("students").select("id, full_name, admission_no").eq("status", "active").order("full_name"); return data || []; },
  });

  const totalCollected = payments.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + p.amount, 0);

  const handleAdd = async () => {
    if (!form.student_id || !form.amount) return toast.error("Student and amount required");
    const school = payments[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const receiptNo = `RCP-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from("fee_payments").insert({
      student_id: form.student_id, amount: Number(form.amount), payment_method: form.payment_method,
      school_id: school, receipt_no: receiptNo, status: "completed",
    });
    if (error) return toast.error(error.message);
    toast.success(`Payment recorded. Receipt: ${receiptNo}`);
    setAddOpen(false); setForm({ student_id: "", amount: "", payment_method: "cash" }); refetch();
  };

  const filtered = payments.filter((p: any) => (p as any).students?.full_name?.toLowerCase().includes(search.toLowerCase()) || p.receipt_no?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Fee Payments</h1><p className="text-muted-foreground text-sm mt-1">Track and record fee payments</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Record Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Student *</Label>
                  <Select value={form.student_id} onValueChange={v => setForm(p => ({ ...p, student_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>{students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.admission_no || "No Adm"})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><Label>Payment Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm(p => ({ ...p, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="cheque">Cheque</SelectItem><SelectItem value="online">Online</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Record Payment</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Collected", value: `₹${totalCollected.toLocaleString()}`, icon: TrendingUp },
            { label: "Transactions", value: payments.length, icon: Wallet },
            { label: "Today", value: payments.filter((p: any) => new Date(p.payment_date).toDateString() === new Date().toDateString()).length, icon: IndianRupee },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by name or receipt..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Student</TableHead><TableHead>Receipt</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{(p as any).students?.full_name}</TableCell>
                    <TableCell className="text-xs font-mono">{p.receipt_no || "—"}</TableCell>
                    <TableCell className="font-medium">₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.payment_method}</Badge></TableCell>
                    <TableCell className="text-sm">{new Date(p.payment_date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell><Badge variant={p.status === "completed" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeePayments;
