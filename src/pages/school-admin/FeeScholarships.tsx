import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Award, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Scholarship { id: string; name: string; type: string; amount: number; criteria: string; status: string; }

const FeeScholarships = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    const saved = localStorage.getItem("scholarships");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Merit Scholarship", type: "merit", amount: 25000, criteria: "90%+ in previous exam", status: "active" },
      { id: "2", name: "Sports Excellence", type: "sports", amount: 15000, criteria: "State-level achievement", status: "active" },
      { id: "3", name: "Financial Aid", type: "need", amount: 20000, criteria: "Income < ₹2L/year", status: "active" },
    ];
  });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "merit", amount: "", criteria: "" });

  const save = (data: Scholarship[]) => { setScholarships(data); localStorage.setItem("scholarships", JSON.stringify(data)); };

  const handleAdd = () => {
    if (!form.name || !form.amount) return toast.error("Name and amount required");
    save([...scholarships, { id: crypto.randomUUID(), name: form.name, type: form.type, amount: Number(form.amount), criteria: form.criteria, status: "active" }]);
    toast.success("Scholarship added"); setAddOpen(false); setForm({ name: "", type: "merit", amount: "", criteria: "" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this scholarship?")) return;
    save(scholarships.filter(s => s.id !== id)); toast.success("Removed");
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Scholarships</h1><p className="text-muted-foreground text-sm mt-1">Manage scholarship programs</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Scholarship</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Scholarship</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="merit">Merit</SelectItem><SelectItem value="sports">Sports</SelectItem><SelectItem value="need">Need-based</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                <div><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
                <div><Label>Criteria</Label><Input value={form.criteria} onChange={e => setForm(p => ({ ...p, criteria: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Scholarship</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Programs", value: scholarships.length },
            { label: "Active", value: scholarships.filter(s => s.status === "active").length },
            { label: "Total Budget", value: `₹${scholarships.reduce((s, sc) => s + sc.amount, 0).toLocaleString()}` },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><Award className="w-5 h-5" /></div>
                <div><div className="text-xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Criteria</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {scholarships.map(s => (
                  <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell><Badge variant="outline" className="capitalize">{s.type}</Badge></TableCell><TableCell className="font-medium">₹{s.amount.toLocaleString()}</TableCell><TableCell className="text-sm text-muted-foreground">{s.criteria || "—"}</TableCell><TableCell><Badge variant="default">{s.status}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FeeScholarships;
