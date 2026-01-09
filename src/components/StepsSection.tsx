import { Button } from "@/components/ui/button";
import { Link, Wand2, Rocket, Smartphone, Store } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Link,
    title: "Colle ton lien AliExpress",
    description: "Copie le lien du produit AliExpress que tu veux vendre. Notre IA récupère automatiquement toutes les infos.",
    time: "30 secondes",
  },
  {
    number: 2,
    icon: Wand2,
    title: "L'IA génère ton app",
    description: "Notre IA crée une application e-commerce complète : design, fiches produits, paiements, tout est prêt.",
    time: "2 minutes",
  },
  {
    number: 3,
    icon: Rocket,
    title: "Lance et vends",
    description: "Ton app est prête à recevoir des commandes. Partage le lien et commence à vendre immédiatement.",
    time: "Instantané",
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
            Simple comme 1-2-3
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            De lien AliExpress à app prête
            <br />
            en 3 étapes simples
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Plus besoin de coder ou de designer. Colle ton lien, notre IA fait le reste.
          </p>
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

        {/* Example Apps */}
        <div className="text-center">
          <p className="text-muted-foreground mb-8">
            Exemples d'apps générées par notre IA
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              { name: "TechWatch Pro", category: "Montres" },
              { name: "BeautyGlow", category: "Beauté" },
            ].map((app, i) => (
              <div
                key={i}
                className="glass rounded-xl overflow-hidden card-hover border-gradient w-72"
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                  <Smartphone className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="p-4 text-left">
                  <p className="font-semibold">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
