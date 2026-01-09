import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wand2, ShoppingBag, CreditCard, Palette, ArrowRight, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";

import mockupSkincare from "@/assets/mockup-skincare.png";
import mockupFitness from "@/assets/mockup-fitness.png";
import mockupSmartwatch from "@/assets/mockup-smartwatch.png";
import mockupHeadphones from "@/assets/store-mockup-preview.png";

const storeMockups = [
  { id: 1, image: mockupHeadphones, name: "Casque Audio Premium", category: "Électronique" },
  { id: 2, image: mockupSkincare, name: "Sérum Anti-Âge", category: "Beauté" },
  { id: 3, image: mockupFitness, name: "Bandes de Résistance", category: "Fitness" },
  { id: 4, image: mockupSmartwatch, name: "Montre Connectée", category: "Tech" },
];

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
  const [currentMockup, setCurrentMockup] = useState(0);

  const activeFeature = tabs.find((tab) => tab.id === activeTab)!;

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMockup((prev) => (prev + 1) % storeMockups.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextMockup = () => {
    setCurrentMockup((prev) => (prev + 1) % storeMockups.length);
  };

  const prevMockup = () => {
    setCurrentMockup((prev) => (prev - 1 + storeMockups.length) % storeMockups.length);
  };

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
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Description */}
          <div className="order-2 lg:order-1 text-center lg:text-left px-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              {activeFeature.title}
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
              {activeFeature.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
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

          {/* Right: Preview Card with Carousel */}
          <div className="order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none">
            <div className="glass rounded-2xl p-1 card-hover border-gradient">
              <div className="bg-card rounded-xl overflow-hidden">
                {/* Mock App Header */}
                <div className="bg-secondary/50 p-3 sm:p-4 flex items-center gap-4 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-muted px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                      <Smartphone className="w-3 h-3" />
                      <span className="hidden xs:inline">monapp.dropyfy.app</span>
                      <span className="xs:hidden">dropyfy.app</span>
                    </div>
                  </div>
                </div>
                
                {/* Carousel */}
                <div className="relative aspect-[4/3]">
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      className="flex h-full transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentMockup * 100}%)` }}
                    >
                      {storeMockups.map((mockup) => (
                        <img 
                          key={mockup.id}
                          src={mockup.image} 
                          alt={mockup.name}
                          className="w-full h-full object-cover flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button 
                    onClick={prevMockup}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextMockup}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {storeMockups.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMockup(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentMockup 
                            ? "bg-white w-6" 
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Current Store Label */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-white/70">{storeMockups[currentMockup].category}</p>
                    <p className="text-xs sm:text-sm font-medium text-white">{storeMockups[currentMockup].name}</p>
                  </div>
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
