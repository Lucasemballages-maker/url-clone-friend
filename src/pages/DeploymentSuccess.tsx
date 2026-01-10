import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PartyPopper, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Loader2, 
  ArrowRight,
  CreditCard,
  Globe,
  Share2,
  LayoutDashboard
} from "lucide-react";
import { useShopifyExportStore } from "@/stores/shopifyExportStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface DeployResult {
  success: boolean;
  storeId: string;
  subdomain: string;
  url: string;
  message?: string;
  error?: string;
}

const DeploymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { storeData, reset } = useShopifyExportStore();
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStep, setDeployStep] = useState("");
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    // Redirect if no store data
    if (!authLoading && !storeData) {
      toast.error("Aucune donnée de store trouvée");
      navigate("/dashboard");
      return;
    }

    // Auto-deploy when component mounts
    if (user && storeData && !deployResult && !isDeploying) {
      handleDeploy();
    }
  }, [user, storeData, authLoading, deployResult, isDeploying]);

  const handleDeploy = async () => {
    if (!storeData) return;

    setIsDeploying(true);
    setDeployProgress(10);
    setDeployStep("Préparation du déploiement...");

    try {
      setDeployProgress(30);
      setDeployStep("Création du sous-domaine...");
      
      await new Promise(resolve => setTimeout(resolve, 500));

      setDeployProgress(50);
      setDeployStep("Déploiement de votre boutique...");

      const { data, error } = await supabase.functions.invoke("deploy-store", {
        body: { storeData },
      });

      if (error) throw error;

      setDeployProgress(80);
      setDeployStep("Finalisation...");

      await new Promise(resolve => setTimeout(resolve, 500));

      if (data.success) {
        setDeployProgress(100);
        setDeployStep("Boutique en ligne !");
        setDeployResult(data);
        toast.success("🎉 Votre boutique est en ligne !");
      } else {
        throw new Error(data.error || "Échec du déploiement");
      }
    } catch (error) {
      console.error("Deploy error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du déploiement";
      toast.error(errorMessage);
      setIsDeploying(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copiée !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToDashboard = () => {
    reset();
    navigate("/dashboard/apps");
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

  // Deploying state
  if (isDeploying && !deployResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">🎉 Paiement confirmé !</CardTitle>
            <CardDescription>
              Déploiement en cours...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">{deployStep}</p>
              <p className="text-sm text-muted-foreground">{deployProgress}%</p>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${deployProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (deployResult?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-3xl">✅ Votre boutique est en ligne !</CardTitle>
            <CardDescription className="text-base">
              Votre site est déployé et accessible au monde entier.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Store URL */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Label className="text-sm text-muted-foreground mb-2 block">🌐 Votre site</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={deployResult.url} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCopyUrl(deployResult.url)}
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                onClick={() => window.open(`/store/${deployResult.subdomain}`, '_blank')}
                className="gap-2"
                size="lg"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir ma boutique
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <LayoutDashboard className="h-4 w-4" />
                Gérer mon site
              </Button>
            </div>

            {/* Next steps */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  💡 Prochaines étapes
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-primary mt-0.5" />
                    <span>Connectez votre Stripe pour recevoir les paiements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-primary mt-0.5" />
                    <span>Personnalisez votre domaine (ex: maboutique.com)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Share2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Partagez votre lien et lancez vos publicités !</span>
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

  // Error or fallback state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Une erreur est survenue</CardTitle>
          <CardDescription>
            Le déploiement n'a pas pu être complété.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleDeploy} className="w-full">
            Réessayer
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
            Retour au dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentSuccess;
