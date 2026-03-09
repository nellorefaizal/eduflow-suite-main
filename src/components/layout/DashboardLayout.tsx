import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart3, Settings, Bell, LogOut,
  School, BookOpen, CalendarDays, Menu, X, ChevronDown, ChevronRight, Moon, Sun,
  GraduationCap, Shield, Headphones, FileText, UserCheck, Bus, Library, Home as HomeIcon,
  Briefcase, Clock, MessageSquare, ClipboardList, Wallet, FileCheck, Award, Megaphone,
  UserCircle, Download, Calculator, Send, MapPin, BookMarked, Search
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "super-admin" | "school-admin" | "teacher" | "student";
}

interface SidebarLink {
  icon: any;
  label: string;
  path?: string;
  children?: { icon: any; label: string; path: string }[];
}

const superAdminLinks: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/super-admin" },
  { icon: Building2, label: "Schools", children: [
    { icon: Building2, label: "All Schools", path: "/dashboard/super-admin/schools" },
    { icon: UserCheck, label: "Approve / Reject", path: "/dashboard/super-admin/schools/approve" },
    { icon: FileText, label: "Activity Logs", path: "/dashboard/super-admin/schools/activity" },
  ]},
  { icon: CreditCard, label: "Subscriptions", children: [
    { icon: CreditCard, label: "Plans", path: "/dashboard/super-admin/subscriptions" },
    { icon: Settings, label: "Feature Access", path: "/dashboard/super-admin/subscriptions/features" },
    { icon: Clock, label: "Trial Settings", path: "/dashboard/super-admin/subscriptions/trials" },
  ]},
  { icon: Wallet, label: "Billing & Revenue", children: [
    { icon: Wallet, label: "Transactions", path: "/dashboard/super-admin/billing" },
    { icon: FileText, label: "Invoices", path: "/dashboard/super-admin/billing/invoices" },
    { icon: Calculator, label: "GST Reports", path: "/dashboard/super-admin/billing/gst" },
  ]},
  { icon: BarChart3, label: "Analytics", path: "/dashboard/super-admin/analytics" },
  { icon: Users, label: "Users", children: [
    { icon: Shield, label: "Super Admins", path: "/dashboard/super-admin/users" },
    { icon: Users, label: "Support Staff", path: "/dashboard/super-admin/users/support" },
    { icon: UserCheck, label: "Role Permissions", path: "/dashboard/super-admin/users/permissions" },
  ]},
  { icon: Headphones, label: "Support", children: [
    { icon: Headphones, label: "Tickets", path: "/dashboard/super-admin/support" },
    { icon: MessageSquare, label: "Live Chat Logs", path: "/dashboard/super-admin/support/chat" },
    { icon: ClipboardList, label: "Complaints", path: "/dashboard/super-admin/support/complaints" },
  ]},
  { icon: FileText, label: "Audit Logs", path: "/dashboard/super-admin/audit" },
  { icon: BarChart3, label: "Usage & Metrics", path: "/dashboard/super-admin/usage" },
  { icon: Settings, label: "Global Settings", path: "/dashboard/super-admin/settings" },
];

const schoolAdminLinks: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/school-admin" },
  { icon: BookOpen, label: "Academics", children: [
    { icon: BookOpen, label: "Classes", path: "/dashboard/school-admin/academics/classes" },
    { icon: BookMarked, label: "Subjects", path: "/dashboard/school-admin/academics/subjects" },
    { icon: CalendarDays, label: "Academic Year", path: "/dashboard/school-admin/academics/year" },
    { icon: FileText, label: "Curriculum", path: "/dashboard/school-admin/academics/curriculum" },
  ]},
  { icon: Users, label: "Students", children: [
    { icon: Users, label: "All Students", path: "/dashboard/school-admin/students" },
    { icon: Award, label: "Promotions", path: "/dashboard/school-admin/students/promote" },
    { icon: FileText, label: "Documents", path: "/dashboard/school-admin/students/documents" },
    { icon: CreditCard, label: "ID Cards", path: "/dashboard/school-admin/students/idcards" },
    { icon: GraduationCap, label: "Alumni", path: "/dashboard/school-admin/students/alumni" },
  ]},
  { icon: Briefcase, label: "Staff", children: [
    { icon: School, label: "Teachers", path: "/dashboard/school-admin/teachers" },
    { icon: Users, label: "Non-Teaching", path: "/dashboard/school-admin/staff/nonteaching" },
    { icon: Wallet, label: "Payroll", path: "/dashboard/school-admin/staff/payroll" },
    { icon: CalendarDays, label: "Leave Mgmt", path: "/dashboard/school-admin/staff/leave" },
  ]},
  { icon: CalendarDays, label: "Attendance", children: [
    { icon: CalendarDays, label: "Daily Attendance", path: "/dashboard/school-admin/attendance" },
    { icon: BarChart3, label: "Reports", path: "/dashboard/school-admin/attendance/reports" },
  ]},
  { icon: ClipboardList, label: "Exams", children: [
    { icon: ClipboardList, label: "Exam Setup", path: "/dashboard/school-admin/exams" },
    { icon: FileCheck, label: "Marks Entry", path: "/dashboard/school-admin/exams/marks" },
    { icon: Award, label: "Report Cards", path: "/dashboard/school-admin/exams/reportcards" },
    { icon: BarChart3, label: "Rankings", path: "/dashboard/school-admin/exams/rankings" },
  ]},
  { icon: CreditCard, label: "Fees & Finance", children: [
    { icon: CreditCard, label: "Fee Structure", path: "/dashboard/school-admin/fees" },
    { icon: Wallet, label: "Payments", path: "/dashboard/school-admin/fees/payments" },
    { icon: FileText, label: "Due Reports", path: "/dashboard/school-admin/fees/due" },
    { icon: Award, label: "Scholarships", path: "/dashboard/school-admin/fees/scholarships" },
  ]},
  { icon: Clock, label: "Timetable", path: "/dashboard/school-admin/timetable" },
  { icon: Megaphone, label: "Communication", children: [
    { icon: Megaphone, label: "Notice Board", path: "/dashboard/school-admin/communication/notices" },
    { icon: Send, label: "Broadcast", path: "/dashboard/school-admin/communication/broadcast" },
    { icon: MessageSquare, label: "Messaging", path: "/dashboard/school-admin/communication/messaging" },
  ]},
  { icon: Bus, label: "Transport", path: "/dashboard/school-admin/transport" },
  { icon: Library, label: "Library", path: "/dashboard/school-admin/library" },
  { icon: HomeIcon, label: "Hostel", path: "/dashboard/school-admin/hostel" },
  { icon: BarChart3, label: "Reports", path: "/dashboard/school-admin/reports" },
  { icon: Settings, label: "Settings", path: "/dashboard/school-admin/settings" },
];

const teacherLinks: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/teacher" },
  { icon: BookOpen, label: "My Classes", children: [
    { icon: BookOpen, label: "Class List", path: "/dashboard/teacher/classes" },
    { icon: Users, label: "Student List", path: "/dashboard/teacher/classes/students" },
  ]},
  { icon: CalendarDays, label: "Attendance", children: [
    { icon: CalendarDays, label: "Mark Attendance", path: "/dashboard/teacher/attendance" },
    { icon: BarChart3, label: "History", path: "/dashboard/teacher/attendance/history" },
  ]},
  { icon: ClipboardList, label: "Assignments", children: [
    { icon: ClipboardList, label: "Create", path: "/dashboard/teacher/assignments" },
    { icon: Download, label: "Study Material", path: "/dashboard/teacher/assignments/material" },
    { icon: FileCheck, label: "Review", path: "/dashboard/teacher/assignments/review" },
  ]},
  { icon: Award, label: "Exams", children: [
    { icon: FileCheck, label: "Enter Marks", path: "/dashboard/teacher/exams" },
    { icon: BarChart3, label: "Results", path: "/dashboard/teacher/exams/results" },
  ]},
  { icon: Clock, label: "Timetable", path: "/dashboard/teacher/timetable" },
  { icon: MessageSquare, label: "Communication", children: [
    { icon: MessageSquare, label: "Messages", path: "/dashboard/teacher/messages" },
    { icon: Megaphone, label: "Announcements", path: "/dashboard/teacher/messages/announcements" },
  ]},
  { icon: CalendarDays, label: "Leave Requests", path: "/dashboard/teacher/leave" },
];

const studentLinks: SidebarLink[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
  { icon: UserCircle, label: "My Profile", children: [
    { icon: UserCircle, label: "Personal Info", path: "/dashboard/student/profile" },
    { icon: FileText, label: "Documents", path: "/dashboard/student/profile/documents" },
    { icon: CreditCard, label: "Digital ID", path: "/dashboard/student/profile/id" },
  ]},
  { icon: CalendarDays, label: "Attendance", path: "/dashboard/student/attendance" },
  { icon: BookOpen, label: "Academics", children: [
    { icon: BookOpen, label: "Subjects", path: "/dashboard/student/academics" },
    { icon: Download, label: "Study Materials", path: "/dashboard/student/academics/materials" },
  ]},
  { icon: ClipboardList, label: "Assignments", children: [
    { icon: ClipboardList, label: "View", path: "/dashboard/student/assignments" },
    { icon: FileCheck, label: "Submit", path: "/dashboard/student/assignments/submit" },
    { icon: Award, label: "Grades", path: "/dashboard/student/assignments/grades" },
  ]},
  { icon: Award, label: "Exams & Results", children: [
    { icon: CalendarDays, label: "Schedule", path: "/dashboard/student/exams" },
    { icon: Award, label: "Marks", path: "/dashboard/student/exams/marks" },
    { icon: Download, label: "Report Card", path: "/dashboard/student/exams/reportcard" },
  ]},
  { icon: CreditCard, label: "Fees", children: [
    { icon: CreditCard, label: "Payment History", path: "/dashboard/student/fees" },
    { icon: Wallet, label: "Pay Online", path: "/dashboard/student/fees/pay" },
    { icon: Download, label: "Receipts", path: "/dashboard/student/fees/receipts" },
  ]},
  { icon: Clock, label: "Timetable", path: "/dashboard/student/timetable" },
  { icon: Bell, label: "Notifications", path: "/dashboard/student/notifications" },
];

const linkMap: Record<string, SidebarLink[]> = {
  "super-admin": superAdminLinks,
  "school-admin": schoolAdminLinks,
  teacher: teacherLinks,
  student: studentLinks,
};

const roleLabels: Record<string, string> = {
  "super-admin": "Platform",
  "school-admin": "School",
  teacher: "Teacher",
  student: "Student",
};

const SidebarItem = ({ item, pathname, collapsed }: { item: SidebarLink; pathname: string; collapsed: boolean }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some(c => pathname === c.path);
  const isActive = item.path ? pathname === item.path : isChildActive;
  const [open, setOpen] = useState(isChildActive);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
            isChildActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          }`}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3 overflow-hidden"
            >
              {item.children!.map(child => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    pathname === child.path ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                  }`}
                >
                  <child.icon className="w-3.5 h-3.5 shrink-0" />
                  {child.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.path!}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      }`}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const links = linkMap[role] || superAdminLinks;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${isMobile ? "fixed inset-y-0 left-0 z-50" : "relative"} ${
          sidebarOpen ? (collapsed ? "w-16" : "w-64") : "w-0"
        } bg-sidebar flex flex-col shrink-0 transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 flex items-center gap-2.5 border-b border-sidebar-border min-h-[60px]">
          <img src="/logo.png" alt="Nextrova EduCore" className="w-8 h-8 rounded-lg shrink-0" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-sm text-sidebar-foreground truncate">Nextrova</span>
              <span className="text-[10px] text-sidebar-foreground/50 font-medium">EduCore</span>
            </div>
          )}
          {!isMobile && !collapsed && (
            <button onClick={() => setCollapsed(true)} className="ml-auto text-sidebar-foreground/40 hover:text-sidebar-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {collapsed && !isMobile && (
            <button onClick={() => setCollapsed(false)} className="absolute right-1 top-5 text-sidebar-foreground/40 hover:text-sidebar-foreground">
              <Menu className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="px-3 py-2 mt-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3">
              {roleLabels[role]}
            </span>
          </div>
        )}

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto scrollbar-thin py-1">
          {links.map((link) => (
            <SidebarItem key={link.label} item={link} pathname={location.pathname} collapsed={collapsed} />
          ))}
        </nav>

        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          {/* User info */}
          {!collapsed && profile && (
            <div className="px-3 py-2 mb-1">
              <div className="text-xs font-medium text-sidebar-foreground truncate">{profile.full_name || profile.email}</div>
              <div className="text-[10px] text-sidebar-foreground/40 truncate">{profile.email}</div>
            </div>
          )}
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            {darkMode ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
            {!collapsed && (darkMode ? "Light Mode" : "Dark Mode")}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={() => {
              if (collapsed) setCollapsed(false);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            {sidebarOpen && !collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/50 border-0 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-accent" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
