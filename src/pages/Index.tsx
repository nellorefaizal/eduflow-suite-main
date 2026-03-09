import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import { CTASection, Footer } from "@/components/landing/CTAFooter";
import Navbar from "@/components/layout/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, School, GraduationCap, UserCircle, ArrowRight,
  Smartphone, Globe, Palette, Lock, Zap, Cloud, BarChart3,
  MessageSquare, CreditCard, CalendarDays, BookOpen, Users,
  CheckCircle2, Star, Play
} from "lucide-react";

const roleCards = [
  {
    icon: Shield,
    label: "Super Admin",
    desc: "Manage all schools, billing, subscriptions, and platform analytics",
    path: "/login",
    color: "from-destructive/20 to-destructive/5",
    iconColor: "text-destructive",
    features: ["Multi-tenant control", "Revenue analytics", "Global settings"],
  },
  {
    icon: School,
    label: "School Admin",
    desc: "Complete school operations — students, staff, fees, exams, timetable",
    path: "/login",
    color: "from-info/20 to-info/5",
    iconColor: "text-info",
    features: ["Student management", "Fee collection", "Exam reports"],
  },
  {
    icon: GraduationCap,
    label: "Teacher",
    desc: "Classroom tools — attendance, assignments, grades, communication",
    path: "/login",
    color: "from-accent/20 to-accent/5",
    iconColor: "text-accent",
    features: ["Mark attendance", "Create assignments", "Grade students"],
  },
  {
    icon: UserCircle,
    label: "Student",
    desc: "Learning portal — timetable, results, fee payments, study materials",
    path: "/login",
    color: "from-success/20 to-success/5",
    iconColor: "text-success",
    features: ["View results", "Submit homework", "Pay fees online"],
  },
];

const whyUs = [
  { icon: Smartphone, title: "Mobile First", desc: "Perfectly optimized for phones, tablets, and desktops" },
  { icon: Globe, title: "White Label Ready", desc: "Custom domains, logos, and themes for each school" },
  { icon: Palette, title: "Dark Mode", desc: "Beautiful light & dark themes with one-click toggle" },
  { icon: Lock, title: "Enterprise Security", desc: "Role-based access, audit logs, and encrypted data" },
  { icon: Zap, title: "Lightning Fast", desc: "Optimized performance with instant page loads" },
  { icon: Cloud, title: "Cloud Native", desc: "Auto-scaling infrastructure with 99.9% uptime" },
];

const modules = [
  { icon: Users, label: "Student Management" },
  { icon: GraduationCap, label: "Staff & Payroll" },
  { icon: CalendarDays, label: "Attendance System" },
  { icon: BookOpen, label: "Exam & Results" },
  { icon: CreditCard, label: "Fee Management" },
  { icon: MessageSquare, label: "Communication" },
  { icon: BarChart3, label: "Analytics & Reports" },
  { icon: Globe, label: "Transport & GPS" },
];

const testimonials = [
  { name: "Dr. Priya Sharma", role: "Principal, DPS Noida", text: "EduCore transformed how we manage 3,200+ students. Fee collection is now 95% automated.", stars: 5 },
  { name: "Rajesh Kumar", role: "Admin, KV Chennai", text: "The multi-tenant architecture is brilliant. Our 5 branches all run seamlessly on one platform.", stars: 5 },
  { name: "Anita Desai", role: "Teacher, Ryan International", text: "Marking attendance and grading assignments takes half the time now. Incredible teacher tools.", stars: 5 },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />

        {/* Role Cards Section */}
        <section className="py-20 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-info/5 blur-3xl" />
          </div>
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="inline-flex items-center gap-2 text-accent font-semibold text-sm uppercase tracking-wider px-4 py-1.5 rounded-full bg-accent/10 mb-4">
                <Play className="w-3.5 h-3.5" /> Try Each Portal
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
                4 Powerful Dashboards, One Platform
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Each role has its own dedicated portal with tailored tools and modules.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {roleCards.map((role, i) => (
                <motion.div
                  key={role.label}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    to={role.path}
                    className="block p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group h-full"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}>
                      <role.icon className={`w-7 h-7 ${role.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1 font-display">{role.label}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{role.desc}</p>
                    <ul className="space-y-1.5 mb-4">
                      {role.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <span className="text-sm font-semibold text-accent flex items-center gap-1.5 group-hover:gap-3 transition-all">
                      Login & Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />

        {/* Modules Marquee */}
        <section className="py-16 bg-primary overflow-hidden">
          <div className="container mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
                40+ Integrated Modules
              </h2>
              <p className="text-primary-foreground/60 mt-2">Everything runs seamlessly under one roof</p>
            </motion.div>
          </div>
          <div className="flex gap-4 animate-[scroll_20s_linear_infinite] w-max">
            {[...modules, ...modules].map((mod, i) => (
              <div
                key={`${mod.label}-${i}`}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/10 shrink-0"
              >
                <mod.icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-primary-foreground whitespace-nowrap">{mod.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 bg-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Why EduCore</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
                Built for Modern Schools
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                Enterprise-grade features that make school management effortless.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {whyUs.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3">
                Trusted by Educators
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-card shadow-card border border-border/50"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground mb-4 leading-relaxed italic">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
