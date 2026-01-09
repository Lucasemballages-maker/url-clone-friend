import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wand2, ShoppingBag, CreditCard, Palette, ArrowRight, Smartphone } from "lucide-react";

const tabs = [
  {
    id: "generation",
    label: "Génération IA",
    icon: Wand2,
    title: "Une app complète en quelques clics",
    description: "Colle simplement ton lien AliExpress. Notre IA extrait les images, crée des descriptions optimisées pour la conversion, et génère une app e-commerce professionnelle prête à vendre.",
  },
  {
    id: "products",
    label: "Fiches produits",
    icon: ShoppingBag,
    title: "Fiches produits qui convertissent",
    description: "Descriptions persuasives rédigées par l'IA, images optimisées, avis générés, variantes de produits... Tout est pensé pour maximiser tes conversions et tes ventes.",
  },
  {
    id: "payments",
    label: "Paiements intégrés",
    icon: CreditCard,
    title: "Accepte les paiements immédiatement",
    description: "Stripe est intégré nativement. Carte bancaire, Apple Pay, Google Pay... Tes clients peuvent payer en toute sécurité dès le premier jour. Tu reçois l'argent directement.",
  },
  {
    id: "design",
    label: "Design premium",
    icon: Palette,
    title: "Des designs qui inspirent confiance",
    description: "Templates professionnels, couleurs personnalisables, logos, typographies... Ton app a l'air d'une vraie marque établie. Tes clients font confiance et achètent.",
  },
];

const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState("generation");

  const activeFeature = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Tout inclus
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Une app e-commerce complète
            <br />
            générée par l'IA
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tout ce dont tu as besoin pour lancer ton business de dropshipping, sans aucune compétence technique.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {activeFeature.title}
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {activeFeature.description}
            </p>
            <div className="flex items-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Créer mon app
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="group" asChild>
                <Link to="/pricing">
                  Voir les formules
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className="order-1 lg:order-2">
            <div className="glass rounded-2xl p-1 card-hover border-gradient">
              <div className="bg-card rounded-xl overflow-hidden">
                {/* Mock App */}
                <div className="bg-secondary/50 p-4 flex items-center gap-4 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-muted px-4 py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      monapp.dropyfy.app
                    </div>
                  </div>
                </div>
                
                <div className="p-0">
                  {/* Store Preview Mockup */}
                  <img 
                    src="/src/assets/store-mockup-preview.png" 
                    alt="Aperçu de boutique générée" 
                    className="w-full h-auto rounded-b-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureTabs;
