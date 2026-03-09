import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Bus, Plus, Trash2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

interface Vehicle { id: string; number: string; driver: string; driverPhone: string; route: string; capacity: number; students: number; status: string; }

const Transport = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("transport_vehicles");
    return saved ? JSON.parse(saved) : [
      { id: "1", number: "DL-01-AB-1234", driver: "Raju Singh", driverPhone: "9876543210", route: "Sector 15 → School", capacity: 40, students: 35, status: "active" },
      { id: "2", number: "DL-01-CD-5678", driver: "Mohan Kumar", driverPhone: "9876543211", route: "Sector 22 → School", capacity: 35, students: 28, status: "active" },
      { id: "3", number: "DL-01-EF-9012", driver: "Suresh Yadav", driverPhone: "9876543212", route: "Sector 30 → School", capacity: 40, students: 38, status: "maintenance" },
    ];
  });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ number: "", driver: "", driverPhone: "", route: "", capacity: "40" });

  const save = (data: Vehicle[]) => { setVehicles(data); localStorage.setItem("transport_vehicles", JSON.stringify(data)); };

  const handleAdd = () => {
    if (!form.number || !form.driver) return toast.error("Vehicle number and driver required");
    save([...vehicles, { id: crypto.randomUUID(), ...form, capacity: Number(form.capacity), students: 0, status: "active" }]);
    toast.success("Vehicle added"); setAddOpen(false); setForm({ number: "", driver: "", driverPhone: "", route: "", capacity: "40" });
  };

  const handleDelete = (id: string) => { if (!confirm("Remove?")) return; save(vehicles.filter(v => v.id !== id)); toast.success("Removed"); };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Transport Management</h1><p className="text-muted-foreground text-sm mt-1">Manage vehicles, routes, and drivers</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Vehicle</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Vehicle No *</Label><Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="DL-01-AB-1234" /></div>
                <div><Label>Driver Name *</Label><Input value={form.driver} onChange={e => setForm(p => ({ ...p, driver: e.target.value }))} /></div>
                <div><Label>Driver Phone</Label><Input value={form.driverPhone} onChange={e => setForm(p => ({ ...p, driverPhone: e.target.value }))} /></div>
                <div><Label>Route</Label><Input value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))} placeholder="e.g. Sector 15 → School" /></div>
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Vehicle</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Vehicles", value: vehicles.length, icon: Bus },
            { label: "Active Routes", value: vehicles.filter(v => v.status === "active").length, icon: MapPin },
            { label: "Students Using", value: vehicles.reduce((s, v) => s + v.students, 0), icon: Users },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Vehicle</TableHead><TableHead>Driver</TableHead><TableHead>Route</TableHead><TableHead>Students</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {vehicles.map(v => (
                  <TableRow key={v.id}><TableCell className="font-mono font-medium">{v.number}</TableCell><TableCell><div className="text-sm font-medium">{v.driver}</div><div className="text-xs text-muted-foreground">{v.driverPhone}</div></TableCell><TableCell className="text-sm">{v.route}</TableCell><TableCell>{v.students}/{v.capacity}</TableCell><TableCell><Badge variant={v.status === "active" ? "default" : "secondary"}>{v.status}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transport;
