import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Search, Download, Eye } from "lucide-react";

const StudentDocuments = () => {
  const [search, setSearch] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students-docs"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, classes(name, section)").order("full_name");
      return data || [];
    },
  });

  const filtered = students.filter((s: any) => s.full_name.toLowerCase().includes(search.toLowerCase()) || s.admission_no?.toLowerCase().includes(search.toLowerCase()));

  const docTypes = ["Transfer Certificate", "Character Certificate", "Bonafide Certificate", "Migration Certificate"];

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Student Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">Generate and manage student certificates</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {docTypes.map((doc, i) => (
            <motion.div key={doc} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10"><FileText className="w-5 h-5 text-primary" /></div>
                  <div><div className="text-sm font-medium">{doc}</div><div className="text-xs text-muted-foreground">Generate</div></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Adm No</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.slice(0, 50).map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{s.full_name.charAt(0)}</div><span className="font-medium text-sm">{s.full_name}</span></div></TableCell>
                    <TableCell><Badge variant="outline">{(s as any).classes?.name} {(s as any).classes?.section}</Badge></TableCell>
                    <TableCell className="text-sm">{s.admission_no || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" /> View</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Download className="w-3 h-3" /> TC</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No students found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDocuments;
