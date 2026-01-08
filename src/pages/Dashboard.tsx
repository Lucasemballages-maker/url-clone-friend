import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { TrendingUp, Store, ShoppingBag, DollarSign, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { name: "Produits analysés", value: "12,847", change: "+12%", icon: ShoppingBag },
  { name: "Boutiques suivies", value: "89", change: "+5%", icon: Store },
  { name: "Pubs sauvegardées", value: "234", change: "+23%", icon: TrendingUp },
  { name: "Revenue estimé", value: "$45,231", change: "+18%", icon: DollarSign },
];

const recentProducts = [
  { name: "Smart Watch Pro", category: "Electronics", sales: "$12,450", trend: "+15%" },
  { name: "Yoga Mat Premium", category: "Fitness", sales: "$8,920", trend: "+8%" },
  { name: "LED Strip Lights", category: "Home Decor", sales: "$6,780", trend: "+22%" },
  { name: "Phone Case Ultra", category: "Accessories", sales: "$5,340", trend: "+11%" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenue ! Voici un aperçu de tes données.</p>
          </div>
          <Link to="/dashboard/generate">
            <Button variant="hero" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Générer une boutique
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="glass rounded-xl p-6 card-hover border-gradient">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm text-success font-medium">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="glass rounded-xl p-6 border-gradient">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Produits tendance</h2>
              <Link to="/dashboard/products">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.sales}</p>
                    <p className="text-sm text-success">{product.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6 border-gradient">
            <h2 className="text-lg font-semibold mb-6">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/dashboard/generate" className="block">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-6 text-center hover:from-primary/30 hover:to-accent/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium">Générer boutique</p>
                  <p className="text-xs text-muted-foreground mt-1">Avec l'IA</p>
                </div>
              </Link>
              <Link to="/dashboard/products" className="block">
                <div className="bg-secondary rounded-xl p-6 text-center hover:bg-secondary/80 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Trouver produit</p>
                  <p className="text-xs text-muted-foreground mt-1">100k+ produits</p>
                </div>
              </Link>
              <Link to="/dashboard/shops" className="block">
                <div className="bg-secondary rounded-xl p-6 text-center hover:bg-secondary/80 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Store className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Analyser boutique</p>
                  <p className="text-xs text-muted-foreground mt-1">Espionner concurrence</p>
                </div>
              </Link>
              <Link to="/dashboard/ads" className="block">
                <div className="bg-secondary rounded-xl p-6 text-center hover:bg-secondary/80 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Voir les pubs</p>
                  <p className="text-xs text-muted-foreground mt-1">Ads qui marchent</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
