import { motion } from "framer-motion";
import { LucideIcon, Construction } from "lucide-react";

interface SkeletonPageProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  stats?: { label: string; value: string; icon: LucideIcon }[];
  cards?: { title: string; description: string }[];
}

const SkeletonPage = ({ title, subtitle, icon: Icon, stats, cards }: SkeletonPageProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        {title}
      </h1>
      <p className="text-muted-foreground mt-1 ml-13">{subtitle}</p>
    </div>

    {stats && (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl bg-card shadow-card border border-border/50"
          >
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <stat.icon className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    )}

    {cards && (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-xl bg-card shadow-card border border-border/50"
          >
            <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.description}</p>
          </motion.div>
        ))}
      </div>
    )}

    {!stats && !cards && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-12 rounded-xl bg-card shadow-card border border-border/50 text-center"
      >
        <Construction className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Module Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This module is under development. Full functionality will be available in the next release.
        </p>
      </motion.div>
    )}
  </div>
);

export default SkeletonPage;