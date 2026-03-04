import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "API Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLandingPage = location === "/";

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      if (isLandingPage) {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        setLocation("/");
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      setLocation(href);
    }
  };

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return location === href || location.startsWith(href + "/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => handleNavClick("/")} className="flex items-center gap-3" data-testid="link-home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
            W
          </div>
          <span className="font-display font-bold text-xl" data-testid="text-brand">QuackAPI</span>
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-sm font-medium transition-colors ${isActive(link.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" onClick={() => setLocation("/auth")} data-testid="button-login">
            Log In
          </Button>
          <Button onClick={() => setLocation("/auth")} className="shadow-lg shadow-primary/25" data-testid="button-signup">
            Get Started
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg" data-testid="mobile-menu">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-border/50 mt-2 pt-3 flex flex-col gap-2">
              <Button variant="ghost" onClick={() => { setMobileOpen(false); setLocation("/auth"); }} className="justify-start" data-testid="mobile-button-login">
                Log In
              </Button>
              <Button onClick={() => { setMobileOpen(false); setLocation("/auth"); }} className="shadow-lg shadow-primary/25" data-testid="mobile-button-signup">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
