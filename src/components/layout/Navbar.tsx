import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const bgClass = !isLanding || scrolled
    ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}>
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <img src="/logo.png" alt="Nextrova EduCore" className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col leading-tight">
            <span className={isLanding && !scrolled ? "text-primary-foreground text-base" : "text-foreground text-base"}>Nextrova</span>
            <span className={`text-[10px] font-medium ${isLanding && !scrolled ? "text-primary-foreground/50" : "text-muted-foreground"}`}>EduCore</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`text-sm font-medium transition-colors hover:text-accent ${isLanding && !scrolled ? "text-primary-foreground/70" : "text-muted-foreground"}`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant={isLanding && !scrolled ? "heroOutline" : "outline"} size="sm">Login</Button>
          </Link>
          <Link to="/login">
            <Button variant="accent" size="sm">Get Started</Button>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden ${isLanding && !scrolled ? "text-primary-foreground" : "text-foreground"}`}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-2 animate-fade-in">
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button variant="accent" className="w-full justify-center">Sign In / Sign Up</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
