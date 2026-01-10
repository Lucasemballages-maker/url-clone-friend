import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ExternalLink, 
  Store, 
  ShoppingBag, 
  RefreshCw, 
  Settings,
  TrendingUp,
  Package,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  created_at: string;
}

interface ExportedStore {
  id: string;
  product_name: string;
  product_url: string;
  product_image: string | null;
  updated_at: string;
}

export const ShopifyStoreSection = () => {
  const { user } = useAuth();
  const [connection, setConnection] = useState<ShopifyConnection | null>(null);
  const [exports, setExports] = useState<ExportedStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch Shopify connection
        const { data: connData } = await supabase
          .from("shopify_connections")
          .select("id, shop_domain, created_at")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (connData) {
          setConnection(connData);
        }

        // Fetch exported stores
        const { data: exportsData } = await supabase
          .from("store_configurations")
          .select("id, product_name, product_url, product_image, updated_at")
          .eq("user_id", user.id)
          .eq("type", "shopify_export")
          .order("updated_at", { ascending: false })
          .limit(5);

        if (exportsData) {
          setExports(exportsData);
        }
      } catch (err) {
        console.error("Error fetching Shopify data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!connection) {
    return null;
  }

  const shopUrl = `https://${connection.shop_domain}`;
  const adminUrl = `https://${connection.shop_domain}/admin`;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Ma Boutique Shopify</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {connection.shop_domain}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
            Connectée
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Package className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{exports.length}</div>
            <div className="text-xs text-muted-foreground">Produits exportés</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">--</div>
            <div className="text-xs text-muted-foreground">Ventes</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Eye className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">--</div>
            <div className="text-xs text-muted-foreground">Visites</div>
          </div>
        </div>

        {/* Recent Exports */}
        {exports.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Derniers produits exportés</h4>
            <div className="space-y-2">
              {exports.slice(0, 3).map((exp) => (
                <div 
                  key={exp.id} 
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {exp.product_image ? (
                    <img 
                      src={exp.product_image} 
                      alt={exp.product_name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{exp.product_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(exp.updated_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(exp.product_url, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.open(shopUrl, "_blank")}
          >
            <Eye className="w-4 h-4" />
            Voir la boutique
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.open(adminUrl, "_blank")}
          >
            <Settings className="w-4 h-4" />
            Dashboard Shopify
          </Button>
        </div>

        <div className="mt-3">
          <Button 
            variant="secondary" 
            className="w-full gap-2"
            onClick={() => window.open(`${adminUrl}/orders`, "_blank")}
          >
            <ShoppingBag className="w-4 h-4" />
            Voir les commandes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifyStoreSection;
