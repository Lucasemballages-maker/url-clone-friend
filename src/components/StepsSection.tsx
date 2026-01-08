import { Button } from "@/components/ui/button";
import { Link, Wand2, Upload } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Link,
    title: "Copie le lien du produit",
    description: "Copie le lien de la page de ton produit via AliExpress ou n'importe quel boutique Shopify.",
    time: "Gagne 2 heures",
  },
  {
    number: 2,
    icon: Wand2,
    title: "Génération automatique",
    description: "Copyfy récupère les images et génère ta boutique 100% personnalisable.",
    time: "Gagne 35 heures",
  },
  {
    number: 3,
    icon: Upload,
    title: "Import et vente",
    description: "Connecte ton compte Shopify à ta boutique, importe ta nouvelle boutique et commence à vendre.",
    time: "Gagne 3 heures",
  },
];

const StepsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Génère ta boutique
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Génère ta boutique optimisée conversion
            <br />
            en 3 étapes simples
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] right-0 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <div className="glass rounded-2xl p-8 card-hover border-gradient text-center h-full">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-6">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>
                  
                  <Button variant="hero-outline" size="sm">
                    {step.time}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Example Shops */}
        <div className="text-center">
          <p className="text-muted-foreground mb-8">
            Boutiques d'exemples générés par Copyfy
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="glass rounded-xl overflow-hidden card-hover border-gradient w-72"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                  <Store className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="p-4">
                  <Button variant="ghost" size="sm" className="w-full">
                    Voir boutique
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Import needed icon
import { Store } from "lucide-react";

export default StepsSection;
