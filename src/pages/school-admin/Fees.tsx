import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CreditCard, Plus, Trash2, IndianRupee, TrendingUp, Clock } from "lucide-react";

const Fees = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", frequency: "monthly" });

  const { data: structures = [], refetch } = useQuery({
    queryKey: ["fee-structures"], queryFn: async () => { const { data } = await supabase.from("fee_structures").select("*, classes(name, section)").order("name"); return data || []; },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["fee-payments"], queryFn: async () => { const { data } = await supabase.from("fee_payments").select("*, students(full_name)").order("payment_date", { ascending: false }); return data || []; },
  });

  const totalCollected = payments.filter((p: any) => p.status === "completed").reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalPending = payments.filter((p: any) => p.status === "pending").reduce((sum: number, p: any) => sum + p.amount, 0);

  const handleAdd = async () => {
    if (!form.name || !form.amount) return toast.error("Name and amount required");
    const school = structures[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("fee_structures").insert({ ...form, amount: Number(form.amount), school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Fee structure added"); setAddOpen(false); setForm({ name: "", amount: "", frequency: "monthly" }); refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this fee structure?")) return;
    const { error } = await supabase.from("fee_structures").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); refetch();
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Fees & Finance</h1><p className="text-muted-foreground text-sm mt-1">Manage fee structures and payments</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Fee Structure</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Fee Structure</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Fee Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Tuition Fee" /></div>
                <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><Label>Frequency</Label>
                  <Select value={form.frequency} onValueChange={v => setForm(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Structure</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Fee Structures", value: structures.length, icon: CreditCard },
            { label: "Collected", value: `₹${totalCollected.toLocaleString()}`, icon: TrendingUp },
            { label: "Pending", value: `₹${totalPending.toLocaleString()}`, icon: Clock },
            { label: "Payments", value: payments.length, icon: IndianRupee },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Fee Structures</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Amount</TableHead><TableHead>Freq</TableHead><TableHead className="text-right">Del</TableHead></TableRow></TableHeader>
                <TableBody>
                  {structures.map((s: any) => (
                    <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell>₹{s.amount.toLocaleString()}</TableCell><TableCell><Badge variant="outline" className="capitalize">{s.frequency}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Recent Payments</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead>Student</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {payments.slice(0, 10).map((p: any) => (
                    <TableRow key={p.id}><TableCell className="font-medium text-sm">{(p as any).students?.full_name}</TableCell><TableCell>₹{p.amount.toLocaleString()}</TableCell><TableCell className="capitalize text-sm">{p.payment_method}</TableCell>
                    <TableCell><Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Fees;
