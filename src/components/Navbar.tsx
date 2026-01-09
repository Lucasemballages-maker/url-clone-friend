import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-lg text-foreground">copyfy</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <span>Ressources</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Affiliation
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Connexion</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth">Essai gratuit</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Solutions
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Ressources
              </a>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Tarifs
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Affiliation
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Button variant="ghost" className="w-full justify-center" asChild>
                  <Link to="/auth">Connexion</Link>
                </Button>
                <Button variant="hero" className="w-full justify-center" asChild>
                  <Link to="/auth">Essai gratuit</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
