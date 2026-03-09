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
import { Users, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string; name: string; role: string; phone: string; salary: number; status: string;
}

const StaffNonTeaching = () => {
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem("non_teaching_staff");
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "clerk", phone: "", salary: "" });

  const save = (data: StaffMember[]) => { setStaff(data); localStorage.setItem("non_teaching_staff", JSON.stringify(data)); };

  const handleAdd = () => {
    if (!form.name) return toast.error("Name required");
    const newMember: StaffMember = { id: crypto.randomUUID(), name: form.name, role: form.role, phone: form.phone, salary: Number(form.salary) || 0, status: "active" };
    save([...staff, newMember]);
    toast.success("Staff member added");
    setAddOpen(false);
    setForm({ name: "", role: "clerk", phone: "", salary: "" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    save(staff.filter(s => s.id !== id));
    toast.success("Removed");
  };

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const roles = ["Clerk", "Accountant", "Peon", "Guard", "Driver", "Cook", "Sweeper", "Lab Assistant", "Librarian", "IT Support"];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Non-Teaching Staff</h1><p className="text-muted-foreground text-sm mt-1">Manage administrative and support staff</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Staff</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Role</Label>
                  <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Salary (₹)</Label><Input type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Staff</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted text-primary"><Users className="w-5 h-5" /></div>
            <div><div className="text-2xl font-bold">{staff.length}</div><div className="text-xs text-muted-foreground">Total Staff</div></div>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted text-emerald-600"><Users className="w-5 h-5" /></div>
            <div><div className="text-2xl font-bold">{staff.filter(s => s.status === "active").length}</div><div className="text-xs text-muted-foreground">Active</div></div>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted text-amber-600"><Users className="w-5 h-5" /></div>
            <div><div className="text-2xl font-bold">₹{staff.reduce((s, m) => s + m.salary, 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Monthly Payroll</div></div>
          </CardContent></Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Salary</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}><TableCell className="font-medium">{s.name}</TableCell><TableCell><Badge variant="outline" className="capitalize">{s.role}</Badge></TableCell><TableCell>{s.phone || "—"}</TableCell><TableCell>₹{s.salary.toLocaleString()}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No non-teaching staff added yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StaffNonTeaching;
