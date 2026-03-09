import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GraduationCap, Search, UserCheck, UserX } from "lucide-react";

const StudentAlumni = () => {
  const [search, setSearch] = useState("");

  const { data: alumni = [], refetch } = useQuery({
    queryKey: ["alumni"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, classes(name, section)").eq("status", "alumni").order("full_name");
      return data || [];
    },
  });

  const { data: inactive = [] } = useQuery({
    queryKey: ["inactive-students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, classes(name, section)").eq("status", "inactive").order("full_name");
      return data || [];
    },
  });

  const handleMarkAlumni = async (id: string, name: string) => {
    const { error } = await supabase.from("students").update({ status: "alumni" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`${name} moved to alumni`);
    refetch();
  };

  const filtered = alumni.filter((s: any) => s.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Alumni Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track passed-out students and alumni records</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><GraduationCap className="w-5 h-5 text-primary" /></div>
            <div><div className="text-2xl font-bold font-display">{alumni.length}</div><div className="text-xs text-muted-foreground">Total Alumni</div></div>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted text-amber-600"><UserX className="w-5 h-5" /></div>
            <div><div className="text-2xl font-bold font-display">{inactive.length}</div><div className="text-xs text-muted-foreground">Inactive Students</div></div>
          </CardContent></Card>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search alumni..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Name</TableHead><TableHead>Last Class</TableHead><TableHead>Adm No</TableHead><TableHead>Contact</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.full_name.charAt(0)}</div><span className="font-medium text-sm">{s.full_name}</span></div></TableCell>
                    <TableCell><Badge variant="outline">{(s as any).classes?.name} {(s as any).classes?.section}</Badge></TableCell>
                    <TableCell className="text-sm">{s.admission_no || "—"}</TableCell>
                    <TableCell className="text-sm">{s.phone || s.guardian_phone || "—"}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No alumni records found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAlumni;
