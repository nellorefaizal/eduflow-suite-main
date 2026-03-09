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
import { Library as LibraryIcon, Plus, Trash2, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Book { id: string; title: string; author: string; isbn: string; category: string; copies: number; available: number; }

const Library = () => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem("library_books");
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Mathematics for Class 10", author: "R.D. Sharma", isbn: "978-0-123456-78-9", category: "Textbook", copies: 50, available: 42 },
      { id: "2", title: "Science & Technology", author: "Lakhmir Singh", isbn: "978-0-123456-79-0", category: "Textbook", copies: 45, available: 38 },
      { id: "3", title: "Harry Potter", author: "J.K. Rowling", isbn: "978-0-123456-80-1", category: "Fiction", copies: 10, available: 3 },
      { id: "4", title: "Wings of Fire", author: "APJ Abdul Kalam", isbn: "978-0-123456-81-2", category: "Biography", copies: 15, available: 12 },
    ];
  });
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", category: "textbook", copies: "1" });

  const save = (data: Book[]) => { setBooks(data); localStorage.setItem("library_books", JSON.stringify(data)); };

  const handleAdd = () => {
    if (!form.title) return toast.error("Title required");
    save([...books, { id: crypto.randomUUID(), title: form.title, author: form.author, isbn: form.isbn, category: form.category, copies: Number(form.copies), available: Number(form.copies) }]);
    toast.success("Book added"); setAddOpen(false); setForm({ title: "", author: "", isbn: "", category: "textbook", copies: "1" });
  };

  const handleDelete = (id: string) => { if (!confirm("Remove?")) return; save(books.filter(b => b.id !== id)); toast.success("Removed"); };

  const filtered = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
  const totalBooks = books.reduce((s, b) => s + b.copies, 0);
  const totalAvailable = books.reduce((s, b) => s + b.available, 0);
  const issued = totalBooks - totalAvailable;

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl md:text-3xl font-display font-bold">Library Management</h1><p className="text-muted-foreground text-sm mt-1">Manage books, issues, and returns</p></div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Add Book</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Author</Label><Input value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))} /></div>
                <div><Label>ISBN</Label><Input value={form.isbn} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))} /></div>
                <div><Label>Category</Label><Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="textbook">Textbook</SelectItem><SelectItem value="fiction">Fiction</SelectItem><SelectItem value="non-fiction">Non-Fiction</SelectItem><SelectItem value="reference">Reference</SelectItem><SelectItem value="biography">Biography</SelectItem></SelectContent></Select></div>
                <div><Label>Copies</Label><Input type="number" value={form.copies} onChange={e => setForm(p => ({ ...p, copies: e.target.value }))} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full mt-4">Add Book</Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Titles", value: books.length, icon: BookOpen },
            { label: "Total Copies", value: totalBooks, icon: LibraryIcon },
            { label: "Available", value: totalAvailable, color: "text-emerald-600" },
            { label: "Issued", value: issued, color: "text-amber-600" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card"><CardContent className="p-4">
                <div className="text-2xl font-bold">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-3"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>Title</TableHead><TableHead>Author</TableHead><TableHead>Category</TableHead><TableHead>Copies</TableHead><TableHead>Available</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map(b => (
                  <TableRow key={b.id}><TableCell className="font-medium">{b.title}<div className="text-xs text-muted-foreground">{b.isbn}</div></TableCell><TableCell>{b.author}</TableCell><TableCell><Badge variant="outline" className="capitalize">{b.category}</Badge></TableCell><TableCell>{b.copies}</TableCell><TableCell><Badge variant={b.available > 0 ? "default" : "destructive"}>{b.available}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Library;
