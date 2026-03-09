import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { MessageSquare, Search, Send, Users } from "lucide-react";

const CommMessaging = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string; time: string }[]>([]);

  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers-msg"], queryFn: async () => { const { data } = await supabase.from("teachers").select("id, full_name, email, subject_specialization").eq("status", "active").order("full_name"); return data || []; },
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students-msg"], queryFn: async () => { const { data } = await supabase.from("students").select("id, full_name, email, guardian_name").eq("status", "active").order("full_name"); return data || []; },
  });

  const contacts = [
    ...teachers.map((t: any) => ({ ...t, type: "Teacher" })),
    ...students.map((s: any) => ({ ...s, type: "Student" })),
  ].filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()));

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    setMessages(prev => [...prev, { from: "You", text: message, time: new Date().toLocaleTimeString() }]);
    setMessage("");
  };

  return (
    <DashboardLayout role="school-admin">
      <div className="p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Messaging</h1>
          <p className="text-muted-foreground text-sm mt-1">Direct messaging with staff and parents</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Contacts */}
          <Card className="shadow-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-300px)]">
              {contacts.map(c => (
                <button key={c.id} onClick={() => { setSelectedUser(c); setMessages([]); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 ${selectedUser?.id === c.id ? "bg-primary/5" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.full_name.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.full_name}</div>
                    <div className="text-xs text-muted-foreground">{c.type} {c.subject_specialization ? `• ${c.subject_specialization}` : ""}</div>
                  </div>
                </button>
              ))}
              {contacts.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No contacts found</div>}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="shadow-card lg:col-span-2 flex flex-col overflow-hidden">
            {selectedUser ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{selectedUser.full_name.charAt(0)}</div>
                    <div><CardTitle className="text-base">{selectedUser.full_name}</CardTitle><p className="text-xs text-muted-foreground">{selectedUser.type} • {selectedUser.email || "No email"}</p></div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && <div className="text-center text-muted-foreground text-sm py-12">Start a conversation</div>}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "You" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-xl px-4 py-2 ${m.from === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <p className="text-sm">{m.text}</p>
                        <p className="text-[10px] opacity-60 mt-1">{m.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="p-3 border-t flex gap-2">
                  <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1" onKeyDown={e => e.key === "Enter" && handleSend()} />
                  <Button onClick={handleSend} size="icon"><Send className="w-4 h-4" /></Button>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a contact to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommMessaging;
