import { Users, Layout, Sliders, Sparkles, GraduationCap, MessageCircle } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Adapté aux débutants",
    description: "Clair et direct. Pas besoin d'être expert.",
  },
  {
    icon: Layout,
    title: "Plateforme tout-en-un",
    description: "Tout ce qu'il te faut pour aller de 0 à ta première vente et plus encore.",
  },
  {
    icon: Sliders,
    title: "Vue personnalisable",
    description: "Filtre, trie, ou enregistre. Adapte tes recherches à tes besoins.",
  },
  {
    icon: Sparkles,
    title: "Boosté par l'IA",
    description: "Recherche, génère et obtiens tout avec Copyfy AI.",
  },
  {
    icon: GraduationCap,
    title: "Formation Ecommerce",
    description: "Suis un chemin défini par des experts e-commerce. GRATUIT.",
  },
  {
    icon: MessageCircle,
    title: "Coaching hebdomadaire",
    description: "Rencontre et discute avec un expert e-commerce.",
  },
];

const BenefitsGrid = () => {
  return (
    <section className="py-24 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
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
