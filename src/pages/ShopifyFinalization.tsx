import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2, ExternalLink, HelpCircle, Store, PartyPopper, ArrowRight, Copy, CheckCircle } from "lucide-react";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ExportResult {
  success: boolean;
  productId?: string;
  productHandle?: string;
  productUrl?: string;
  pageId?: string;
  pageHandle?: string;
  pageUrl?: string;
  shopDomain?: string;
  storeUrl?: string;
  variantId?: string;
  checkoutUrl?: string;
  message?: string;
  error?: string;
}

const ShopifyFinalization = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { 
    storeData,
    isExporting, 
    exportProgress, 
    exportStep, 
    setExporting, 
    setProgress, 
    setExportedProduct,
    setError,
    reset 
  } = useShopifyExportStore();
  
  const [shopDomain, setShopDomain] = useState("");
  const [storefrontToken, setStorefrontToken] = useState("");
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [hasNoShop, setHasNoShop] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Redirect if no store data
    if (!authLoading && !storeData) {
      toast.error("Aucune donnée de store trouvée");
      navigate("/dashboard");
    }
  }, [storeData, navigate, authLoading]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleCreateStore = async () => {
    if (!shopDomain.trim()) {
      toast.error("Veuillez entrer le nom de votre boutique Shopify");
      return;
    }
    
    if (!storefrontToken.trim()) {
      toast.error("Veuillez entrer votre Storefront Access Token");
      return;
    }

    // Clean the shop domain
    let cleanDomain = shopDomain.trim().toLowerCase();
    if (!cleanDomain.includes('.myshopify.com')) {
      cleanDomain = `${cleanDomain}.myshopify.com`;
    }

    setExporting(true);
    setProgress(5, "Préparation des données...");

    try {
      setProgress(15, "Connexion à votre boutique Shopify...");
      
      const { data, error } = await supabase.functions.invoke("create-full-shopify-store", {
        body: { 
          storeData,
          shopDomain: cleanDomain,
          storefrontToken: storefrontToken.trim()
        },
      });

      if (error) throw error;

      setProgress(50, "Création du produit...");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(75, "Création de la page de vente...");
      
      await new Promise(resolve => setTimeout(resolve, 500));

      if (data.success) {
        setProgress(100, "Boutique créée avec succès !");
        setExportedProduct(data.productId);
        setExportResult(data);
        toast.success("🎉 Votre boutique est prête !");
      } else {
        throw new Error(data.error || "Échec de la création");
      }
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création";
      setError(errorMessage);
      toast.error(errorMessage);
      setExporting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copiée !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    reset();
    navigate("/dashboard");
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Chargement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (exportResult?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-3xl">🎉 Votre boutique est prête !</CardTitle>
            <CardDescription className="text-base">
              Tout a été créé automatiquement. Votre site est en ligne !
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Store URL */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label className="text-sm text-muted-foreground mb-2 block">Votre site de vente</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={exportResult.pageUrl || exportResult.storeUrl || ""} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopyUrl(exportResult.pageUrl || exportResult.storeUrl || "")}
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => window.open(exportResult.pageUrl || exportResult.storeUrl, '_blank')}
                className="gap-2"
                size="lg"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir ma boutique
              </Button>
              
              <Button 
                onClick={() => window.open(`https://${exportResult.shopDomain}/admin`, '_blank')}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Store className="h-4 w-4" />
                Admin Shopify
              </Button>
            </div>

            {/* Next steps */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Prochaines étapes
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Configurez vos modes de paiement dans Shopify</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Ajoutez votre domaine personnalisé (optionnel)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Lancez vos premières publicités !</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Create another */}
            <Button 
              onClick={handleCreateAnother}
              variant="ghost"
              className="w-full gap-2"
            >
              Créer une autre boutique
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">✅ Paiement confirmé !</CardTitle>
          <CardDescription>
            Dernière étape : connectez votre boutique Shopify
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isExporting ? (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">{exportStep}</p>
                <p className="text-sm text-muted-foreground">{exportProgress}%</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          ) : hasNoShop ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                <p className="text-amber-600 font-medium mb-2">
                  Vous n'avez pas encore de boutique Shopify ?
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez votre boutique gratuitement, puis revenez ici pour finaliser.
                </p>
                <Button 
                  onClick={() => window.open('https://www.shopify.com/free-trial', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Créer ma boutique Shopify
                </Button>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setHasNoShop(false)}
                className="w-full"
              >
                J'ai déjà une boutique
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shop domain input */}
              <div className="space-y-2">
                <Label htmlFor="shopDomain">Nom de votre boutique Shopify</Label>
                <div className="flex items-center">
                  <Input 
                    id="shopDomain"
                    placeholder="ma-boutique"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                    .myshopify.com
                  </span>
                </div>
              </div>

              {/* Storefront token input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="storefrontToken">Storefront Access Token</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-primary"
                    onClick={() => window.open('https://help.shopify.com/en/manual/apps/app-types/custom-apps#create-a-custom-app', '_blank')}
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Comment obtenir mon token ?
                  </Button>
                </div>
                <Input 
                  id="storefrontToken"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={storefrontToken}
                  onChange={(e) => setStorefrontToken(e.target.value)}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Créez une app privée dans Shopify → Settings → Apps → Develop apps
                </p>
              </div>

              {/* Submit button */}
              <Button 
                onClick={handleCreateStore}
                className="w-full gap-2"
                size="lg"
                disabled={!shopDomain.trim() || !storefrontToken.trim()}
              >
                <Store className="h-5 w-5" />
                Créer ma boutique complète
              </Button>

              {/* No shop link */}
              <Button 
                variant="link"
                onClick={() => setHasNoShop(true)}
                className="w-full text-muted-foreground"
              >
                Je n'ai pas encore de boutique Shopify
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyFinalization;
