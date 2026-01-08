import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTASection = () => {
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <section className="py-24 relative" id="pricing">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Social proof avatars */}
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-3">
              {avatars.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt=""
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
          </div>
          
          <p className="text-muted-foreground mb-2">
            <span className="text-foreground font-semibold">29,870+</span> ont déjà rejoint
          </p>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Lance ta boutique aujourd'hui
            <br />
            gratuitement avec l'IA
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button variant="hero" size="xl">
              Commencer mon essai gratuit
            </Button>
            <Button variant="hero-outline" size="xl">
              Voir les tarifs
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>✓ Annule quand tu veux</span>
            <span>✓ Pas de CB requise</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
