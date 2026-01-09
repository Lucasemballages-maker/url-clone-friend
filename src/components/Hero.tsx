import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Package } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-gradient mb-8 animate-fade-in-up">
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              NOUVEAU
            </span>
            <span className="text-sm text-muted-foreground">
              Colle ton lien AliExpress → App prête
            </span>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Colle ton lien AliExpress
            <br />
            <span className="text-gradient">Reçois ton app e-commerce</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Colle un lien produit AliExpress et notre IA génère une application e-commerce complète, prête à vendre. Design professionnel, fiches produits optimisées, paiements intégrés.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">
                <Package className="w-5 h-5 mr-2" />
                Créer mon app maintenant
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/pricing">
                Voir les formules
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary">❝</span>
              <span className="uppercase tracking-wider text-xs">
                Déjà <span className="text-foreground font-semibold">+19,328</span>
              </span>
              <span className="uppercase tracking-wider text-xs">Apps générées</span>
              <span className="text-primary">❞</span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Avatars */}
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
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
