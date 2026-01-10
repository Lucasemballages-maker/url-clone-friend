import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Store, Package, Settings, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  scopes: string | null;
  created_at: string;
  updated_at: string;
}

const ShopifyApp = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [connection, setConnection] = useState<ShopifyConnection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchConnection();
    }
  }, [user, authLoading, navigate]);

  const fetchConnection = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("shopify_connections")
        .select("id, shop_domain, scopes, created_at, updated_at")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching connection:", error);
      }
      
      setConnection(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getShopifyAdminUrl = () => {
    if (!connection) return "#";
    return `https://${connection.shop_domain}/admin`;
  };

  const getShopifyProductsUrl = () => {
    if (!connection) return "#";
    return `https://${connection.shop_domain}/admin/products`;
  };

  const getShopifyThemesUrl = () => {
    if (!connection) return "#";
    return `https://${connection.shop_domain}/admin/themes`;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!connection) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Aucune boutique connectée</CardTitle>
              <CardDescription>
                Connectez votre boutique Shopify pour commencer à exporter vos produits.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Mon App Shopify</h1>
              <p className="text-muted-foreground">Gérez votre boutique connectée</p>
            </div>
          </div>
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connecté
          </Badge>
        </div>

        {/* Shop Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>{connection.shop_domain}</CardTitle>
                <CardDescription>
                  Connecté le {new Date(connection.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {connection.scopes?.split(",").map((scope) => (
                <Badge key={scope} variant="secondary" className="text-xs">
                  {scope.trim()}
                </Badge>
              ))}
            </div>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => window.open(getShopifyAdminUrl(), "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir Shopify Admin
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open(getShopifyProductsUrl(), "_blank")}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Produits</h3>
              <p className="text-sm text-muted-foreground">Gérer vos produits</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => window.open(getShopifyThemesUrl(), "_blank")}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <Settings className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">Thèmes</h3>
              <p className="text-sm text-muted-foreground">Personnaliser l'apparence</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate("/dashboard")}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <RefreshCw className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="font-semibold mb-1">Créer un produit</h3>
              <p className="text-sm text-muted-foreground">Ajouter via l'IA</p>
            </CardContent>
          </Card>
        </div>

        {/* Export History - placeholder for future */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique des exports</CardTitle>
            <CardDescription>Vos derniers produits exportés vers Shopify</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun export pour le moment</p>
              <p className="text-sm">Créez un produit et exportez-le vers votre boutique</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ShopifyApp;
