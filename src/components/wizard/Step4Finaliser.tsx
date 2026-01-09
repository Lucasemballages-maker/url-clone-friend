import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StorePreview from "./StorePreview";
import PricingModal from "./PricingModal";
import { StoreData } from "@/types/store";
import { useSubscription } from "@/hooks/useSubscription";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { useNavigate } from "react-router-dom";
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
}: Step4FinaliserProps) => {
  const { subscribed, createCheckout } = useSubscription();
  const { setStoreData } = useShopifyExportStore();
  const navigate = useNavigate();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectShopify = async () => {
    if (!subscribed) {
      // Store the data for after payment
      setStoreData(storeData);
      // Show pricing modal
      setShowPricingModal(true);
    } else {
      // User has subscription, go directly to export
      setStoreData(storeData);
      navigate("/payment-success");
    }
  };

  const handleSelectPlan = async (planId: string, isYearly: boolean) => {
    // Store the data before checkout
    setStoreData(storeData);
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

        <Button variant="hero" size="xl" className="gap-3" onClick={handleConnectShopify}>
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M15.337 3.415c-.193-.016-.233.296-.233.296l-.318 2.033-.022-.007A4.667 4.667 0 0 0 13.119 5c-1.736-.011-3.075.84-3.583 2.136-.507 1.296.012 2.755.862 3.675.851.92 2.088 1.447 3.295 2.135 1.207.688 2.422 1.54 2.764 3.073.342 1.533-.344 3.285-1.838 4.246-1.493.96-3.744.95-5.545-.158a7.357 7.357 0 0 1-2.217-2.1l1.263-2.1c.41.544.923 1.016 1.517 1.39 1.13.716 2.534.878 3.522.287.988-.59 1.342-1.82.91-2.757-.432-.937-1.523-1.583-2.597-2.197-1.074-.614-2.193-1.304-2.907-2.411-.714-1.107-.984-2.674-.394-4.017.59-1.343 2.064-2.423 3.893-2.564 1.828-.14 3.8.545 5.065 1.935l-1.292 2.009z"/>
          </svg>
          Connecter votre Shopify
        </Button>
      </div>

      {/* Pricing Modal for non-authenticated users */}
      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
};

export default Step4Finaliser;
