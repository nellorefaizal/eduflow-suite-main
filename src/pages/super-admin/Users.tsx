import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Search, UserCheck, Mail } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const roleColors: Record<string, string> = {
  super_admin: "text-destructive bg-destructive/10",
  school_admin: "text-accent bg-accent/10",
  teacher: "text-info bg-info/10",
  student: "text-success bg-success/10",
};

const SuperAdminUsers = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email, avatar_url, created_at");
      if (!roles || !profiles) return [];
      return profiles.map(p => ({
        ...p,
        role: roles.find(r => r.user_id === p.user_id)?.role || "unknown",
      }));
    },
  });

  const filtered = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = {
    super_admin: users.filter(u => u.role === "super_admin").length,
    school_admin: users.filter(u => u.role === "school_admin").length,
    teacher: users.filter(u => u.role === "teacher").length,
    student: users.filter(u => u.role === "student").length,
  };

  return (
    <DashboardLayout role="super-admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Users</h1>
          <p className="text-muted-foreground mt-1">{users.length} total registered users</p>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: "Super Admins", count: roleCounts.super_admin, icon: Shield, role: "super_admin" },
            { label: "School Admins", count: roleCounts.school_admin, icon: UserCheck, role: "school_admin" },
            { label: "Teachers", count: roleCounts.teacher, icon: Users, role: "teacher" },
            { label: "Students", count: roleCounts.student, icon: Users, role: "student" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setFilterRole(filterRole === stat.role ? "all" : stat.role)}
              className={`p-5 rounded-xl bg-card shadow-card border cursor-pointer transition-all ${filterRole === stat.role ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:shadow-card-hover"}`}>
              <div className={`w-10 h-10 rounded-lg ${roleColors[stat.role]} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">User</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Role</th>
                  <th className="text-left py-3 px-5 text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1,2,3].map(i => <tr key={i}><td colSpan={4} className="py-4 px-5"><div className="h-6 bg-muted animate-pulse rounded" /></td></tr>)
                ) : filtered.map(user => (
                  <tr key={user.user_id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {user.full_name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-foreground">{user.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || "text-muted-foreground bg-muted"}`}>
                        {user.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminUsers;
