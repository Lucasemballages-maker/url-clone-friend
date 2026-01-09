import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, ArrowRight, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscription } = useSubscription();
  const { 
    isExporting, 
    exportProgress, 
    exportStep, 
    exportedProductId,
    storeData,
    setExporting, 
    setProgress, 
    setExportedProduct,
    setError,
    reset 
  } = useShopifyExportStore();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      setIsVerifying(true);
      
      // Refresh subscription status
      await checkSubscription();
      
      // Small delay for better UX
      setTimeout(() => {
        setPaymentVerified(true);
        setIsVerifying(false);
      }, 1500);
    };

    verifyPayment();
  }, [checkSubscription]);

  const handleExportToShopify = async () => {
    if (!storeData) {
      toast.error("Aucune donnée de store à exporter");
      navigate("/dashboard");
      return;
    }

    setExporting(true);
    setProgress(10, "Préparation des données...");

    try {
      setProgress(30, "Connexion à Shopify...");
      
      const { data, error } = await supabase.functions.invoke("export-to-shopify", {
        body: { storeData },
      });

      if (error) throw error;

      setProgress(70, "Création du produit...");
      
      if (data.success) {
        setProgress(100, "Exportation terminée !");
        setExportedProduct(data.productId);
        toast.success("Produit exporté vers Shopify avec succès !");
      } else {
        throw new Error(data.error || "Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      setError(error instanceof Error ? error.message : "Erreur lors de l'export");
      toast.error("Erreur lors de l'export vers Shopify");
    } finally {
      setExporting(false);
    }
  };

  const handleGoToDashboard = () => {
    reset();
    navigate("/dashboard");
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Vérification du paiement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>
            Votre abonnement est maintenant actif. Vous pouvez exporter votre store vers Shopify.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!exportedProductId ? (
            <>
              {isExporting ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>{exportStep}</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={handleExportToShopify}
                    className="w-full gap-2"
                    size="lg"
                    disabled={!storeData}
                  >
                    <svg 
                      className="w-5 h-5" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M15.337 3.415c-.193-.016-.233.296-.233.296l-.318 2.033-.022-.007A4.667 4.667 0 0 0 13.119 5c-1.736-.011-3.075.84-3.583 2.136-.507 1.296.012 2.755.862 3.675.851.92 2.088 1.447 3.295 2.135 1.207.688 2.422 1.54 2.764 3.073.342 1.533-.344 3.285-1.838 4.246-1.493.96-3.744.95-5.545-.158a7.357 7.357 0 0 1-2.217-2.1l1.263-2.1c.41.544.923 1.016 1.517 1.39 1.13.716 2.534.878 3.522.287.988-.59 1.342-1.82.91-2.757-.432-.937-1.523-1.583-2.597-2.197-1.074-.614-2.193-1.304-2.907-2.411-.714-1.107-.984-2.674-.394-4.017.59-1.343 2.064-2.423 3.893-2.564 1.828-.14 3.8.545 5.065 1.935l-1.292 2.009z"/>
                    </svg>
                    Exporter vers Shopify
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleGoToDashboard}
                    className="w-full"
                  >
                    Retour au dashboard
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-green-600 font-medium text-center">
                  ✨ Votre produit a été exporté avec succès !
                </p>
              </div>
              
              <Button 
                onClick={() => window.open(`https://admin.shopify.com`, '_blank')}
                className="w-full gap-2"
                variant="outline"
              >
                <ExternalLink className="w-4 h-4" />
                Voir dans Shopify Admin
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                className="w-full gap-2"
              >
                Créer un autre store
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
