import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Eye, EyeOff, ArrowRight, Lock, Mail, Sparkles, User,
  Shield, School, GraduationCap, UserCircle, BookOpen,
  BarChart3, Users, Zap
} from "lucide-react";

const rolePathMap: Record<string, string> = {
  super_admin: "/dashboard/super-admin",
  school_admin: "/dashboard/school-admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up always as school_admin
        const { error } = await signUp(email, password, fullName, "school-admin");
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        toast.success("School account created! Signing you in...");
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          toast.error(signInError.message);
          setLoading(false);
          return;
        }
        navigate("/dashboard/school-admin");
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }
        // Fetch the user's role from the database and redirect
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .limit(1)
            .single();
          const userRole = roleData?.role || "student";
          toast.success("Welcome back!");
          navigate(rolePathMap[userRole] || "/dashboard/student");
        } else {
          navigate("/dashboard/student");
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Premium Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-primary/90 to-accent/80 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/10 blur-2xl" />
          <div className="absolute bottom-1/3 left-1/3 w-32 h-32 rounded-full bg-white/3 blur-xl" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Nextrova EduCore" className="w-11 h-11 rounded-xl shadow-lg group-hover:scale-105 transition-transform" />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-display font-bold text-xl tracking-tight">Nextrova</span>
              <span className="text-white/40 text-[10px] font-semibold tracking-widest uppercase">EduCore Platform</span>
            </div>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white font-display mb-4 leading-tight">
              One Platform.<br />
              <span className="text-white/70">Every Role.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-sm leading-relaxed">
              Sign in with your credentials and we'll take you to the right dashboard automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: School, label: "School Admin", desc: "Complete school operations & management" },
              { icon: GraduationCap, label: "Teacher", desc: "Attendance, assignments & grading" },
              { icon: UserCircle, label: "Student", desc: "Academics, results & fee payments" },
            ].map((role, i) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]"
              >
                <role.icon className="w-5 h-5 text-white/70 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">{role.label}</p>
                  <p className="text-white/40 text-[11px]">{role.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {[
              { icon: Zap, text: "Auto role detection on login" },
              { icon: Lock, text: "Enterprise-grade security" },
              { icon: BarChart3, text: "Real-time analytics & insights" },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-3.5 h-3.5 text-white/80" />
                </div>
                <span className="text-white/70 text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 text-white/30 text-xs font-medium">© 2026 Nextrova EduCore. All rights reserved.</div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <img src="/logo.png" alt="Nextrova EduCore" className="w-10 h-10 rounded-xl shadow-md" />
            <div className="flex flex-col leading-tight">
              <span className="text-foreground font-display font-bold text-lg">Nextrova</span>
              <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">EduCore</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display mb-2">
              {isSignUp ? "Register Your School" : "Welcome Back"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSignUp
                ? "Create your school admin account to get started"
                : "Sign in with your credentials — we'll auto-detect your role"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school" className="text-sm font-semibold text-foreground">School Name</Label>
                    <div className="relative">
                      <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="school"
                        placeholder="Delhi Public School"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent/10 border border-accent/20">
                    <School className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-accent font-medium">You'll be registered as a School Administrator</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-accent hover:underline font-semibold">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl border-border/60 bg-muted/30 focus:bg-background transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold text-[15px] bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  {isSignUp ? "Creating school account..." : "Signing in..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isSignUp ? "Register School" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isSignUp ? (
                <>Already have an account? <span className="font-semibold text-accent">Sign In</span></>
              ) : (
                <>New school? <span className="font-semibold text-accent">Register Here</span></>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
