import { motion } from "framer-motion";
import { Settings, Globe, Mail, Shield, Bell, Palette, Database } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

const settingSections = [
  {
    icon: Globe,
    title: "Platform Settings",
    desc: "Configure platform name, logo, and default settings",
    fields: [
      { label: "Platform Name", value: "EduNexus", type: "text" },
      { label: "Support Email", value: "support@edunexus.in", type: "email" },
      { label: "Default Currency", value: "INR (₹)", type: "text" },
      { label: "Default Timezone", value: "Asia/Kolkata (IST)", type: "text" },
    ],
  },
  {
    icon: Mail,
    title: "Email & Notifications",
    desc: "Configure email templates and notification preferences",
    fields: [
      { label: "SMTP Provider", value: "SendGrid", type: "text" },
      { label: "From Email", value: "noreply@edunexus.in", type: "email" },
      { label: "Welcome Email", value: "Enabled", type: "toggle" },
      { label: "Payment Reminders", value: "Enabled", type: "toggle" },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    desc: "Authentication and security settings",
    fields: [
      { label: "Two-Factor Auth", value: "Required for Admins", type: "text" },
      { label: "Session Timeout", value: "30 minutes", type: "text" },
      { label: "Password Policy", value: "Strong (8+ chars, mixed)", type: "text" },
      { label: "Login Attempts", value: "5 before lockout", type: "text" },
    ],
  },
  {
    icon: Database,
    title: "Data & Backup",
    desc: "Database and backup configuration",
    fields: [
      { label: "Auto Backup", value: "Daily at 2:00 AM IST", type: "text" },
      { label: "Retention Period", value: "90 days", type: "text" },
      { label: "Storage Provider", value: "AWS S3", type: "text" },
      { label: "Data Encryption", value: "AES-256", type: "text" },
    ],
  },
];

const SuperAdminSettings = () => (
  <DashboardLayout role="super-admin">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Platform configuration and preferences</p>
        </div>
        <Button variant="accent" size="lg">Save Changes</Button>
      </div>

      <div className="space-y-6">
        {settingSections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-xl bg-card shadow-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <section.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.desc}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                  <input
                    type="text"
                    defaultValue={field.value}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default SuperAdminSettings;
