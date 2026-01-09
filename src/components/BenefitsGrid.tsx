import { Zap, Palette, CreditCard, Smartphone, Shield, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Prêt en 2 minutes",
    description: "Colle ton lien, l'IA génère ton app. C'est aussi simple que ça.",
  },
  {
    icon: Palette,
    title: "Design professionnel",
    description: "Templates premium qui inspirent confiance et convertissent.",
  },
  {
    icon: CreditCard,
    title: "Paiements Stripe intégrés",
    description: "Accepte CB, Apple Pay, Google Pay dès le premier jour.",
  },
  {
    icon: Smartphone,
    title: "App mobile-first",
    description: "Optimisée pour mobile où tes clients achètent vraiment.",
  },
  {
    icon: Shield,
    title: "Sécurisé & fiable",
    description: "Hébergement premium, SSL inclus, disponibilité 99.9%.",
  },
  {
    icon: Headphones,
    title: "Support réactif",
    description: "Une question ? Notre équipe te répond rapidement.",
  },
];

const BenefitsGrid = () => {
  return (
    <section className="py-24 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            POURQUOI NOUS CHOISIR
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Tout ce qu'il te faut pour vendre
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="glass rounded-2xl p-6 card-hover border-gradient group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsGrid;
