import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => (
  <section className="py-24 gradient-hero relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-10 right-10 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-accent/5 blur-2xl" />
    </div>
    <div className="container relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
        <img src="/logo.png" alt="Nextrova EduCore" className="w-14 h-14 mx-auto mb-6 rounded-xl" />
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Ready to Transform Your School?</h2>
        <p className="text-lg text-primary-foreground/70 mb-8">Join 500+ schools already using Nextrova EduCore to streamline operations and boost student outcomes.</p>
        <Link to="/login">
          <Button variant="hero" size="xl">Get Started Today <ArrowRight className="w-5 h-5" /></Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 bg-primary text-primary-foreground/70">
    <div className="container">
      <div className="grid sm:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary-foreground font-bold text-lg mb-4 font-display">
            <img src="/logo.png" alt="Nextrova" className="w-7 h-7 rounded-lg" />
            <div className="flex flex-col leading-tight">
              <span>Nextrova</span>
              <span className="text-[10px] text-primary-foreground/40 font-medium">EduCore</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">India's most comprehensive multi-tenant school management platform.</p>
        </div>
        {[
          { title: "Product", links: ["Features", "Pricing", "Integrations", "API"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Support", links: ["Help Center", "Documentation", "Status", "Security"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-primary-foreground font-semibold text-sm mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}><a href="#" className="text-sm hover:text-accent transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 pt-8 text-center text-sm">© 2026 Nextrova EduCore. All rights reserved.</div>
    </div>
  </footer>
);

export { CTASection, Footer };