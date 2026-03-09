import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "₹4,999",
    period: "/month",
    desc: "Perfect for small schools up to 500 students",
    features: [
      "Up to 500 students",
      "Student & teacher management",
      "Attendance tracking",
      "Basic fee management",
      "Notice board",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "₹12,999",
    period: "/month",
    desc: "For growing schools that need advanced tools",
    features: [
      "Up to 2,000 students",
      "Everything in Starter",
      "Exam & result management",
      "Transport & library modules",
      "SMS & WhatsApp notifications",
      "Analytics dashboard",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For school chains & large institutions",
    features: [
      "Unlimited students",
      "Everything in Professional",
      "AI-powered insights",
      "Custom domain & branding",
      "API access",
      "Multi-branch management",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    popular: false,
  },
];

const PricingSection = () => (
  <section className="py-24 bg-secondary/50">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-accent font-semibold text-sm uppercase tracking-wider">Pricing</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Start with a 14-day free trial. No credit card required.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-2xl bg-card border transition-all duration-300 ${
              plan.popular
                ? "border-accent shadow-card-hover scale-[1.02]"
                : "border-border/50 shadow-card hover:shadow-card-hover"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-accent text-accent-foreground text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
            <div className="mt-4 mb-2">
              <span className="text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>

            <Link to="/dashboard/super-admin">
              <Button variant={plan.popular ? "hero" : "outline"} className="w-full mb-6" size="lg">
                {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
