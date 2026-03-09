import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Building2, Users, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const HeroSection = () => (
  <section className="relative gradient-hero overflow-hidden min-h-[90vh] flex items-center">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl animate-float" />
      <div className="absolute bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/5 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-primary-foreground/5 blur-xl animate-pulse-glow" />
    </div>
    <div className="container relative z-10 py-20 lg:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/80 text-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          Trusted by 500+ Schools Across India
        </motion.div>

        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6 tracking-tight">
          The Complete
          <span className="block text-accent">School Management</span>
          Platform
        </motion.h1>

        <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg sm:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Nextrova EduCore — Multi-tenant SaaS powering admissions, attendance, fees, exams, and more with AI-driven insights.
        </motion.p>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <Button variant="hero" size="xl">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="heroOutline" size="xl">View School Demo</Button>
          </Link>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-2xl mx-auto">
          {[
            { icon: Building2, label: "500+", sub: "Schools" },
            { icon: Users, label: "2M+", sub: "Students" },
            { icon: GraduationCap, label: "50K+", sub: "Teachers" },
            { icon: Shield, label: "99.9%", sub: "Uptime" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary-foreground">{label}</div>
              <div className="text-sm text-primary-foreground/50">{sub}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;