import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Megaphone, Store, BarChart3, ArrowRight } from "lucide-react";

const tabs = [
  {
    id: "products",
    label: "Parcours des produits gagnants",
    icon: Search,
    title: "Trouve les produits qui se vendent",
    description: "Filtre par niche ou tape le nom d'un produit : Copyfy AI scanne plus de 100 000 produits qui se vendent en ce moment et affiche les meilleurs avec toutes leurs données.",
    cta: "Essaie gratuitement",
    link: "En savoir plus",
  },
  {
    id: "ads",
    label: "Explore les publicités",
    icon: Megaphone,
    title: "Découvre les pubs qui performent",
    description: "Filtre et analyse les publicités qui performent le mieux. Copyfy AI parcourt toutes les plateformes publicitaires pour sélectionner les meilleures pubs dans différentes niches.",
    cta: "Essaie gratuitement",
    link: "En savoir plus",
  },
  {
    id: "shops",
    label: "Découvre les boutiques qui vendent",
    icon: Store,
    title: "Explore les meilleures boutiques",
    description: "Découvre les meilleures boutiques avec leurs données clés : meilleures pubs, nombre de pubs actives, traffic et revenue par mois, bestseller, et plein d'autres.",
    cta: "Essaie gratuitement",
    link: "En savoir plus",
  },
  {
    id: "analysis",
    label: "Analyse tes concurrents",
    icon: BarChart3,
    title: "Traque et analyse la concurrence",
    description: "Traque et analyse tes concurrents. Découvre leurs nouvelles pubs, revenues, marchés, thèmes, produits et apps. Chatte avec Copyfy AI pour obtenir rapidement les informations.",
    cta: "Essaie gratuitement",
    link: "En savoir plus",
  },
];

const FeatureTabs = () => {
  const [activeTab, setActiveTab] = useState("products");

  const activeFeature = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Trouve ton produit gagnant
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-4">
            Copyfy booste ta stratégie de
            <br />
            recherche produit avec l'IA
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Copyfy AI t'aide à trouver les meilleurs produits à lancer en analysant les pubs, les meilleures boutiques et tes concurrents.
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
              <Button variant="hero" size="lg">
                {activeFeature.cta}
              </Button>
              <Button variant="ghost" size="lg" className="group">
                {activeFeature.link}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className="order-1 lg:order-2">
            <div className="glass rounded-2xl p-1 card-hover border-gradient">
              <div className="bg-card rounded-xl overflow-hidden">
                {/* Mock Dashboard */}
                <div className="bg-secondary/50 p-4 flex items-center gap-4 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-muted px-4 py-1.5 rounded-lg text-xs text-muted-foreground">
                      app.copyfy.io
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Sidebar + Main */}
                  <div className="flex gap-4">
                    {/* Mini Sidebar */}
                    <div className="w-40 shrink-0 hidden md:block">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">C</span>
                        </div>
                        <span className="text-sm font-medium">copyfy</span>
                      </div>
                      <div className="space-y-1">
                        {["Dashboard", "Top Products", "Top Shops", "Top Ads"].map((item, i) => (
                          <div
                            key={item}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              i === 1 ? "bg-secondary text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">The Sill</h4>
                        <span className="text-xs text-muted-foreground">Launched in 2016</span>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Estimated Daily Sales", value: "$27,980", change: "+23%" },
                          { label: "Monthly Sales", value: "$839,4K", change: "+23%" },
                          { label: "Products count", value: "140", change: null },
                          { label: "Orders", value: "15,215", change: "+11%" },
                        ].map((stat, i) => (
                          <div key={i} className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-lg">{stat.value}</span>
                              {stat.change && (
                                <span className="text-xs text-success">{stat.change}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
