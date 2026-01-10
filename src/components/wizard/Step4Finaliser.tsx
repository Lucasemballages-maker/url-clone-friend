import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2, Sparkles } from "lucide-react";
import StorePreview from "./StorePreview";
import { StoreData } from "@/types/store";
import { useSubscription } from "@/hooks/useSubscription";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Step4FinaliserProps {
  storeData: StoreData;
  storeUrl: string;
  onBack: () => void;
  onFinish: () => void;
}

export const Step4Finaliser = ({
  storeData,
  onBack,
  onFinish,
}: Step4FinaliserProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, createCheckout, loading: subscriptionLoading } = useSubscription();
  const { setStoreData } = useShopifyExportStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProceedToPayment = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour continuer");
      navigate("/auth");
      return;
    }

    // Save store data to the export store so it's available after payment
    setStoreData(storeData);

    // If already subscribed, go directly to finalization
    if (subscribed) {
      navigate("/shopify-finalization");
      return;
    }

    // Otherwise, proceed to payment
    setIsProcessing(true);
    
    try {
      toast.info("Redirection vers le paiement...");
      await createCheckout("dropyfy_pro", false);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erreur lors de la création du paiement");
      setIsProcessing(false);
    }
  };

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
          <div className="text-right text-sm text-muted-foreground hidden sm:block">
            <p className="font-medium text-foreground">Votre site est prêt !</p>
            <p className="text-xs">
              {subscribed ? "Passez à la création automatique" : "Finalisez pour publier sur Shopify"}
            </p>
          </div>
          
          <Button 
            variant="hero" 
            size="xl" 
            className="gap-3" 
            onClick={handleProceedToPayment}
            disabled={isProcessing || subscriptionLoading}
          >
            {isProcessing || subscriptionLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement...
              </>
            ) : subscribed ? (
              <>
                <Sparkles className="w-5 h-5" />
                Créer ma boutique
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Passer au paiement
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4Finaliser;
