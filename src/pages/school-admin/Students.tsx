import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Users, Search, Plus, Trash2, UserCheck, GraduationCap } from "lucide-react";

const Students = () => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ full_name: "", email: "", phone: "", gender: "Male", guardian_name: "", guardian_phone: "", admission_no: "" });

  const { data: students = [], refetch } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, classes(name, section)").order("full_name");
      return data || [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").order("name");
      return data || [];
    },
  });

  const filtered = students.filter((s: any) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.admission_no?.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "all" || s.class_id === classFilter;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchClass && matchStatus;
  });

  const handleAdd = async () => {
    if (!newStudent.full_name) return toast.error("Name is required");
    const school = students[0]?.school_id || (await supabase.from("schools").select("id").limit(1).single()).data?.id;
    if (!school) return toast.error("No school found");
    const { error } = await supabase.from("students").insert({ ...newStudent, school_id: school });
    if (error) return toast.error(error.message);
    toast.success("Student added successfully");
    setAddOpen(false);
    setNewStudent({ full_name: "", email: "", phone: "", gender: "Male", guardian_name: "", guardian_phone: "", admission_no: "" });
    refetch();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete student "${name}"? This action cannot be undone.`)) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`${name} removed`);
    refetch();
  };

  const totalActive = students.filter((s: any) => s.status === "active").length;
  const totalMale = students.filter((s: any) => s.gender === "Male").length;
  const totalFemale = students.filter((s: any) => s.gender === "Female").length;

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, color: "text-primary" },
    { label: "Active", value: totalActive, icon: UserCheck, color: "text-emerald-600" },
    { label: "Boys", value: totalMale, icon: GraduationCap, color: "text-blue-600" },
    { label: "Girls", value: totalFemale, icon: GraduationCap, color: "text-pink-600" },
  ];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Student Management</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all enrolled students</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="col-span-2"><Label>Full Name *</Label><Input value={newStudent.full_name} onChange={e => setNewStudent(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div><Label>Admission No</Label><Input value={newStudent.admission_no} onChange={e => setNewStudent(p => ({ ...p, admission_no: e.target.value }))} /></div>
                <div><Label>Gender</Label>
                  <Select value={newStudent.gender} onValueChange={v => setNewStudent(p => ({ ...p, gender: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Email</Label><Input value={newStudent.email} onChange={e => setNewStudent(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={newStudent.phone} onChange={e => setNewStudent(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Guardian Name</Label><Input value={newStudent.guardian_name} onChange={e => setNewStudent(p => ({ ...p, guardian_name: e.target.value }))} /></div>
                <div><Label>Guardian Phone</Label><Input value={newStudent.guardian_phone} onChange={e => setNewStudent(p => ({ ...p, guardian_phone: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Student</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}><s.icon className="w-5 h-5" /></div>
                  <div><div className="text-2xl font-bold font-display">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name or admission no..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Adm No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="hidden sm:table-cell">Gender</TableHead>
                    <TableHead className="hidden lg:table-cell">Guardian</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s: any, i: number) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.full_name.charAt(0)}</div>
                          <div><div className="font-medium text-sm">{s.full_name}</div><div className="text-xs text-muted-foreground">{s.email}</div></div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{s.admission_no || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{s.classes?.name} {s.classes?.section || ""}</Badge></TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{s.gender || "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell"><div className="text-sm">{s.guardian_name}</div><div className="text-xs text-muted-foreground">{s.guardian_phone}</div></TableCell>
                      <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"} className="text-xs">{s.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(s.id, s.full_name)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
            <div className="p-3 border-t text-xs text-muted-foreground">Showing {filtered.length} of {students.length} students</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Students;
