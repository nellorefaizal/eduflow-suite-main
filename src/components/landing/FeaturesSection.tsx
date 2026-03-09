import { motion } from "framer-motion";
import {
  Users, BookOpen, CreditCard, BarChart3,
  Brain, CalendarDays, Bell, ShieldCheck,
} from "lucide-react";

const features = [
  { icon: Users, title: "Student & Staff Management", desc: "Complete lifecycle management from admission to alumni tracking." },
  { icon: BookOpen, title: "Exams & Academics", desc: "Create exams, auto-generate report cards, and track performance." },
  { icon: CreditCard, title: "Fee & Billing", desc: "Automated invoicing, payment reminders, and GST-compliant billing." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time insights on attendance, revenue, and student performance." },
  { icon: Brain, title: "AI-Powered Insights", desc: "Dropout prediction, smart timetables, and automated report comments." },
  { icon: CalendarDays, title: "Attendance & Timetable", desc: "Biometric integration, smart scheduling, and leave management." },
  { icon: Bell, title: "Notifications & SMS", desc: "WhatsApp, SMS, and push notifications for parents and staff." },
  { icon: ShieldCheck, title: "Security & RBAC", desc: "Role-based access, audit logs, 2FA, and encrypted data isolation." },
];

const FeaturesSection = () => (
  <section className="py-24 bg-background">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-accent font-semibold text-sm uppercase tracking-wider">Everything You Need</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
          One Platform, Every School Need
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          From admissions to alumni — manage your entire school ecosystem with powerful, integrated modules.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
              <f.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
