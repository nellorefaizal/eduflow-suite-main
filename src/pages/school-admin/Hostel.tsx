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
import { Home, Plus, Trash2, Users, Bed } from "lucide-react";
import { toast } from "sonner";

interface Room { id: string; number: string; floor: string; capacity: number; occupied: number; type: string; }

const Hostel = () => {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem("hostel_rooms");
    return saved ? JSON.parse(saved) : [
      { id: "1", number: "101", floor: "1st", capacity: 4, occupied: 3, type: "boys" },
      { id: "2", number: "102", floor: "1st", capacity: 4, occupied: 4, type: "boys" },
      { id: "3", number: "201", floor: "2nd", capacity: 3, occupied: 2, type: "girls" },
      { id: "4", number: "202", floor: "2nd", capacity: 3, occupied: 3, type: "girls" },
    ];
  });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ number: "", floor: "1st", capacity: "4", type: "boys" });

  const save = (data: Room[]) => { setRooms(data); localStorage.setItem("hostel_rooms", JSON.stringify(data)); };

  const handleAdd = () => {
    if (!form.number) return toast.error("Room number required");
    save([...rooms, { id: crypto.randomUUID(), number: form.number, floor: form.floor, capacity: Number(form.capacity), occupied: 0, type: form.type }]);
    toast.success("Room added"); setAddOpen(false); setForm({ number: "", floor: "1st", capacity: "4", type: "boys" });
  };

  const handleDelete = (id: string) => { if (!confirm("Remove?")) return; save(rooms.filter(r => r.id !== id)); toast.success("Removed"); };

  const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = rooms.reduce((s, r) => s + r.occupied, 0);

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Hostel Management</h1><p className="text-muted-foreground text-sm mt-1">Room allocation and hostel management</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Room</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Room No *</Label><Input value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} /></div>
                <div><Label>Floor</Label><Input value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} /></div>
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} /></div>
                <div><Label>Type</Label><Input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="boys / girls" /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Room</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Rooms", value: rooms.length, icon: Home },
            { label: "Total Beds", value: totalBeds, icon: Bed },
            { label: "Occupied", value: occupied, icon: Users },
            { label: "Available", value: totalBeds - occupied, icon: Bed },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-primary"><s.icon className="w-5 h-5" /></div>
                <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((r, i) => {
            const pct = Math.round((r.occupied / r.capacity) * 100);
            return (
              <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-card hover:shadow-card-hover transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant={r.type === "boys" ? "default" : "secondary"} className="capitalize">{r.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(r.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                    </div>
                    <h3 className="font-display font-bold text-lg">Room {r.number}</h3>
                    <p className="text-xs text-muted-foreground">{r.floor} Floor</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1.5"><span>Occupancy</span><span className="font-medium">{r.occupied}/{r.capacity}</span></div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} /></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Hostel;
