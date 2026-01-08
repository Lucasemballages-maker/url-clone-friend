import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Store,
  TrendingUp,
  Users,
  ShoppingBag,
  ExternalLink,
  Globe,
  BarChart3,
  Eye
} from "lucide-react";

const shops = [
  {
    id: 1,
    name: "The Sill",
    url: "thesill.com",
    country: "🇺🇸",
    category: "Plants & Home",
    monthlyRevenue: "$839,400",
    dailySales: "$27,980",
    products: 140,
    traffic: "450K",
    trend: "+23%",
  },
  {
    id: 2,
    name: "Gymshark",
    url: "gymshark.com",
    country: "🇬🇧",
    category: "Fitness Apparel",
    monthlyRevenue: "$2,450,000",
    dailySales: "$81,666",
    products: 890,
    traffic: "2.1M",
    trend: "+15%",
  },
  {
    id: 3,
    name: "Allbirds",
    url: "allbirds.com",
    country: "🇺🇸",
    category: "Sustainable Footwear",
    monthlyRevenue: "$1,890,000",
    dailySales: "$63,000",
    products: 45,
    traffic: "1.8M",
    trend: "+8%",
  },
  {
    id: 4,
    name: "Glossier",
    url: "glossier.com",
    country: "🇺🇸",
    category: "Beauty & Skincare",
    monthlyRevenue: "$1,234,000",
    dailySales: "$41,133",
    products: 78,
    traffic: "980K",
    trend: "+31%",
  },
  {
    id: 5,
    name: "MVMT",
    url: "mvmt.com",
    country: "🇺🇸",
    category: "Watches & Accessories",
    monthlyRevenue: "$987,000",
    dailySales: "$32,900",
    products: 234,
    traffic: "560K",
    trend: "+12%",
  },
  {
    id: 6,
    name: "Beardbrand",
    url: "beardbrand.com",
    country: "🇺🇸",
    category: "Men's Grooming",
    monthlyRevenue: "$456,000",
    dailySales: "$15,200",
    products: 67,
    traffic: "320K",
    trend: "+19%",
  },
];

const TopShops = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Top Shops</h1>
          <p className="text-muted-foreground">
            Analyse les meilleures boutiques Shopify et découvre leurs stratégies.
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une boutique ou entrer une URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Button variant="hero" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyser une boutique
          </Button>
        </div>

        {/* Shops Table */}
        <div className="glass rounded-xl border-gradient overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-7 gap-4 p-4 bg-secondary/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Boutique</div>
            <div>Revenue mensuel</div>
            <div>Ventes/jour</div>
            <div>Produits</div>
            <div>Traffic</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border/50">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="grid grid-cols-1 lg:grid-cols-7 gap-4 p-4 hover:bg-secondary/30 transition-colors"
              >
                {/* Shop Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <Store className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{shop.name}</h3>
                      <span className="text-lg">{shop.country}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {shop.url}
                    </div>
                    <p className="text-xs text-primary">{shop.category}</p>
                  </div>
                </div>

                {/* Stats - Mobile Grid */}
                <div className="lg:hidden grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue mensuel</p>
                    <p className="font-semibold">{shop.monthlyRevenue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ventes/jour</p>
                    <p className="font-semibold">{shop.dailySales}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Produits</p>
                    <p className="font-semibold">{shop.products}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Traffic</p>
                    <p className="font-semibold">{shop.traffic}</p>
                  </div>
                </div>

                {/* Stats - Desktop */}
                <div className="hidden lg:flex items-center">
                  <div>
                    <p className="font-semibold">{shop.monthlyRevenue}</p>
                    <p className="text-xs text-success flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {shop.trend}
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center font-semibold">
                  {shop.dailySales}
                </div>
                <div className="hidden lg:flex items-center">
                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    {shop.products}
                  </div>
                </div>
                <div className="hidden lg:flex items-center">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {shop.traffic}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 lg:mt-0">
                  <Button variant="hero" size="sm" className="gap-1 flex-1 lg:flex-none">
                    <Eye className="w-4 h-4" />
                    Analyser
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Voir plus de boutiques
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TopShops;
