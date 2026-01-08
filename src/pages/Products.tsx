import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  TrendingUp,
  Star,
  ShoppingBag,
  ExternalLink,
  Heart,
  MoreHorizontal
} from "lucide-react";

const categories = ["Tous", "Electronics", "Fashion", "Home", "Beauty", "Sports", "Toys"];

const products = [
  {
    id: 1,
    name: "Smart Watch Ultra Pro",
    category: "Electronics",
    price: "$49.99",
    revenue: "$125,450",
    orders: "2,345",
    trend: "+25%",
    rating: 4.8,
    image: "🕐",
  },
  {
    id: 2,
    name: "LED Strip Lights RGB",
    category: "Home",
    price: "$19.99",
    revenue: "$89,230",
    orders: "4,567",
    trend: "+42%",
    rating: 4.6,
    image: "💡",
  },
  {
    id: 3,
    name: "Wireless Earbuds Pro",
    category: "Electronics",
    price: "$29.99",
    revenue: "$78,900",
    orders: "2,890",
    trend: "+18%",
    rating: 4.7,
    image: "🎧",
  },
  {
    id: 4,
    name: "Yoga Mat Premium",
    category: "Sports",
    price: "$34.99",
    revenue: "$67,450",
    orders: "1,987",
    trend: "+31%",
    rating: 4.9,
    image: "🧘",
  },
  {
    id: 5,
    name: "Phone Case MagSafe",
    category: "Electronics",
    price: "$14.99",
    revenue: "$56,780",
    orders: "3,456",
    trend: "+15%",
    rating: 4.5,
    image: "📱",
  },
  {
    id: 6,
    name: "Skincare Set Bundle",
    category: "Beauty",
    price: "$59.99",
    revenue: "$45,670",
    orders: "890",
    trend: "+28%",
    rating: 4.8,
    image: "✨",
  },
];

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Top Products</h1>
          <p className="text-muted-foreground">
            Découvre les produits gagnants du moment parmi +100,000 produits analysés.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Filter button */}
          <Button variant="outline" className="gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="glass rounded-xl overflow-hidden card-hover border-gradient group"
            >
              {/* Product Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  <div>
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prix</p>
                  <p className="font-semibold">{product.price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                  <p className="font-semibold">{product.revenue}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Commandes</p>
                  <p className="font-semibold">{product.orders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tendance</p>
                  <p className="font-semibold text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {product.trend}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 pt-0 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <Button variant="hero" size="sm" className="gap-1">
                  Voir détails
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg">
            Charger plus de produits
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Products;
