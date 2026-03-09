import { motion } from "framer-motion";
import { Settings, School, Bell, Shield, Users, Palette } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: School,
    title: "School Information",
    desc: "Basic school details and configuration",
    fields: [
      { label: "School Name", value: "Delhi Public School, Noida" },
      { label: "Affiliation", value: "CBSE - 2130456" },
      { label: "Principal", value: "Dr. Rekha Sharma" },
      { label: "Contact Email", value: "admin@dpsnoida.edu.in" },
      { label: "Phone", value: "+91 120-4567890" },
      { label: "Address", value: "Sector 30, Noida, UP 201301" },
    ],
  },
  {
    icon: Users,
    title: "Academic Configuration",
    desc: "Classes, sections, and academic year settings",
    fields: [
      { label: "Academic Year", value: "2025-26" },
      { label: "Classes", value: "I to XII" },
      { label: "Sections per Class", value: "A, B (some C)" },
      { label: "Grading System", value: "CBSE 9-Point Scale" },
    ],
  },
  {
    icon: Bell,
    title: "Notification Preferences",
    desc: "Configure alerts and communication channels",
    fields: [
      { label: "SMS Alerts", value: "Enabled" },
      { label: "WhatsApp Notifications", value: "Enabled" },
      { label: "Email Reports", value: "Weekly" },
      { label: "Parent App Notifications", value: "Enabled" },
    ],
  },
  {
    icon: Shield,
    title: "Access & Security",
    desc: "User access and security settings",
    fields: [
      { label: "Teacher Login", value: "Email + Password" },
      { label: "Parent Access", value: "Mobile OTP" },
      { label: "Data Export", value: "Admin Only" },
      { label: "Audit Logs", value: "Enabled" },
    ],
  },
];

const SchoolAdminSettings = () => (
  <DashboardLayout role="school-admin">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">School configuration and preferences</p>
        </div>
        <Button variant="accent" size="lg">Save Changes</Button>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
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

export default SchoolAdminSettings;
