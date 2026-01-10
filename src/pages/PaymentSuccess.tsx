import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useSubscription();
  const { storeData } = useShopifyExportStore();
  
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRedirect = async () => {
      setIsVerifying(true);
      
      // Refresh subscription status
      await checkSubscription();
      
      // Small delay for better UX
      setTimeout(() => {
        setIsVerifying(false);
        
        // Redirect to finalization page if we have store data
        if (storeData) {
          navigate("/shopify-finalization");
        } else {
          // If no store data, go back to dashboard
          navigate("/dashboard");
        }
      }, 1500);
    };

    verifyAndRedirect();
  }, [checkSubscription, navigate, storeData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">
            {isVerifying ? "Vérification du paiement..." : "Redirection..."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
