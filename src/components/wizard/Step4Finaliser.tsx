import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, CheckCircle, Loader2, PartyPopper, Store, ShoppingBag, Copy } from "lucide-react";
import StorePreview from "./StorePreview";
import PricingModal from "./PricingModal";
import { StoreData } from "@/types/store";
import { useSubscription } from "@/hooks/useSubscription";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

interface Step4FinaliserProps {
  storeData: StoreData;
  storeUrl: string;
  onBack: () => void;
  onFinish: () => void;
}

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  created_at: string;
}

interface ExportResult {
  success: boolean;
  pageUrl: string;
  productUrl: string;
  storeUrl: string;
  checkoutUrl: string;
  message: string;
}

export const Step4Finaliser = ({
  storeData,
  onBack,
  onFinish,
}: Step4FinaliserProps) => {
  const { subscribed, createCheckout } = useSubscription();
  const { setStoreData } = useShopifyExportStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [shopifyConnection, setShopifyConnection] = useState<ShopifyConnection | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Check for existing Shopify connection
  useEffect(() => {
    const checkConnection = async () => {
      if (!user) {
        setCheckingConnection(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("shopify_connections")
          .select("id, shop_domain, created_at")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setShopifyConnection(data as ShopifyConnection);
        }
      } catch (err) {
        console.error("Error checking Shopify connection:", err);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkConnection();
  }, [user]);

  // Handle OAuth callback
  useEffect(() => {
    const shopifyConnected = searchParams.get("shopify_connected");
    const shopifyError = searchParams.get("shopify_error");
    const shop = searchParams.get("shop");
    const tempToken = searchParams.get("temp_token");

    if (shopifyConnected === "true" && shop) {
      toast.success(`Boutique ${shop} connectée avec succès !`);
      // Refresh connection status
      if (user && tempToken) {
        // Store the connection if we have a temp token
        saveConnection(shop, tempToken);
      }
      // Clear URL params
      navigate("/dashboard", { replace: true });
    } else if (shopifyError) {
      toast.error(`Erreur Shopify: ${shopifyError}`);
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, user, navigate]);

  const saveConnection = async (shop: string, accessToken: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("shopify_connections")
        .upsert({
          user_id: user.id,
          shop_domain: shop,
          access_token: accessToken,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,shop_domain",
        });

      if (!error) {
        setShopifyConnection({
          id: crypto.randomUUID(),
          shop_domain: shop,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error saving connection:", err);
    }
  };

  const handleConnectShopify = () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour continuer");
      navigate("/auth");
      return;
    }

    // Redirect to Shopify OAuth with user_id
    const shop = "haa590-xv.myshopify.com"; // Default shop or prompt user
    const authUrl = `https://jwoofhbzypjzwjowffcr.supabase.co/functions/v1/shopify-auth?shop=${encodeURIComponent(shop)}&user_id=${encodeURIComponent(user.id)}`;
    
    window.location.href = authUrl;
  };

  const handleExportToShopify = async () => {
    // Temporairement désactivé pour test - on permet l'export même sans subscription
    // if (!subscribed) {
    //   setStoreData(storeData);
    //   setShowPricingModal(true);
    //   return;
    // }

    if (!shopifyConnection) {
      toast.error("Veuillez d'abord connecter votre boutique Shopify");
      return;
    }

    setIsExporting(true);

    try {
      // Vérifier la session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast.error("Erreur de session", { description: sessionError.message });
        setIsExporting(false);
        return;
      }

      const session = sessionData.session;

      if (!session?.access_token) {
        toast.error("Session expirée, veuillez vous reconnecter");
        navigate("/auth");
        setIsExporting(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      console.log("=== EXPORT TO SHOPIFY ===");
      console.log("Supabase URL:", supabaseUrl);
      console.log("Shop domain:", shopifyConnection.shop_domain);
      console.log("Store data:", JSON.stringify(storeData, null, 2));
      console.log("Token preview:", session.access_token.substring(0, 30) + "...");
      
      toast.info("Export en cours...", { description: "Création du produit et du thème..." });

      const exportUrl = `${supabaseUrl}/functions/v1/export-to-shopify`;
      console.log("Calling:", exportUrl);
      
      const response = await fetch(exportUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": apiKey,
        },
        body: JSON.stringify({ 
          storeData,
          shopDomain: shopifyConnection.shop_domain
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error("Failed to parse response as JSON");
        throw new Error(`Réponse invalide du serveur: ${responseText.substring(0, 200)}`);
      }

      console.log("Export result:", result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Erreur serveur: ${response.status}`);
      }

      // Store export result for display
      setExportResult({
        success: true,
        pageUrl: result.pageUrl,
        productUrl: result.productUrl,
        storeUrl: result.storeUrl,
        checkoutUrl: result.checkoutUrl,
        message: result.message,
      });

      toast.success("🎉 Boutique exportée vers Shopify !", {
        description: result.message || `Produit créé sur ${shopifyConnection.shop_domain}`,
        duration: 15000,
      });
      
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
        duration: 10000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectPlan = async (planId: string, isYearly: boolean) => {
    setStoreData(storeData);
  };

  // Show success screen after export
  if (exportResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">✅ Votre boutique est prête !</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{exportResult.message}</p>
        
        <Card className="w-full max-w-md mb-6">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Page de vente</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.open(exportResult.pageUrl, "_blank")}>
                <ExternalLink className="w-3 h-3 mr-1" /> Ouvrir
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Produit Shopify</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.open(exportResult.productUrl, "_blank")}>
                <ExternalLink className="w-3 h-3 mr-1" /> Voir
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onFinish}>Créer une autre boutique</Button>
          <Button variant="hero" onClick={() => window.open(exportResult.pageUrl, "_blank")}>
            <ExternalLink className="w-4 h-4 mr-2" /> Ouvrir ma boutique
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Store Preview - Full Width */}
      <div className="flex-1 overflow-auto rounded-xl border border-border mb-6">
        <StorePreview storeData={storeData} />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="flex items-center gap-3">
          {checkingConnection ? (
            <Button disabled variant="outline">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Vérification...
            </Button>
          ) : shopifyConnection ? (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{shopifyConnection.shop_domain}</span>
              </div>
              <Button 
                variant="hero" 
                size="xl" 
                className="gap-3" 
                onClick={handleExportToShopify}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Export en cours...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Exporter vers Shopify
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="hero" size="xl" className="gap-3" onClick={handleConnectShopify}>
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M15.337 3.415c-.193-.016-.233.296-.233.296l-.318 2.033-.022-.007A4.667 4.667 0 0 0 13.119 5c-1.736-.011-3.075.84-3.583 2.136-.507 1.296.012 2.755.862 3.675.851.92 2.088 1.447 3.295 2.135 1.207.688 2.422 1.54 2.764 3.073.342 1.533-.344 3.285-1.838 4.246-1.493.96-3.744.95-5.545-.158a7.357 7.357 0 0 1-2.217-2.1l1.263-2.1c.41.544.923 1.016 1.517 1.39 1.13.716 2.534.878 3.522.287.988-.59 1.342-1.82.91-2.757-.432-.937-1.523-1.583-2.597-2.197-1.074-.614-2.193-1.304-2.907-2.411-.714-1.107-.984-2.674-.394-4.017.59-1.343 2.064-2.423 3.893-2.564 1.828-.14 3.8.545 5.065 1.935l-1.292 2.009z"/>
              </svg>
              Connecter Shopify
            </Button>
          )}
        </div>
      </div>

      {/* Pricing Modal for non-subscribed users */}
      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
};

export default Step4Finaliser;
