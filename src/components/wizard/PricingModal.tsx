import { useState } from "react";
import { Check, Zap, Crown, Rocket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Parfait pour tester et lancer ta première app",
    icon: Zap,
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "1 app e-commerce générée",
      "Design personnalisable",
      "Fiche produit optimisée",
      "Intégration paiements Stripe",
      "Support par email",
    ],
    popular: false,
    cta: "Choisir Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les entrepreneurs qui veulent scaler",
    icon: Crown,
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "5 apps e-commerce générées",
      "Multi-produits par app",
      "Design premium personnalisable",
      "Domaine personnalisé",
      "Support prioritaire",
    ],
    popular: true,
    cta: "Choisir Pro",
  },
  {
    id: "business",
    name: "Business",
    description: "Pour les pros du dropshipping",
    icon: Rocket,
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      "Apps illimitées",
      "Multi-produits illimités",
      "Designs premium exclusifs",
      "Analytics avancés",
      "Support VIP 24/7",
    ],
    popular: false,
    cta: "Choisir Business",
  },
];

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (planId: string, isYearly: boolean) => void;
}

export const PricingModal = ({ open, onOpenChange, onSelectPlan }: PricingModalProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      // Store the selected plan and redirect to auth
      sessionStorage.setItem("selectedPlan", JSON.stringify({ planId, isYearly }));
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    // User is logged in, create checkout session
    setLoadingPlan(planId);
    try {
      await createCheckout(planId, isYearly);
      // Checkout opened in new tab, show confirmation
      toast({
        title: "Paiement en cours",
        description: "La page de paiement Stripe s'est ouverte dans un nouvel onglet.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold">
            Choisissez votre formule pour continuer
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            {user ? "Sélectionnez un plan pour accéder à toutes les fonctionnalités" : "Créez un compte et connectez votre Shopify en quelques clics"}
          </p>
        </DialogHeader>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 py-4">
          <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Mensuel
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
            Annuel
          </span>
          {isYearly && (
            <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full">
              -17%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? "/an" : "/mois";
            const isLoading = loadingPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    : "border-border/50 bg-card/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAIRE
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{price}€</span>
                    <span className="text-muted-foreground text-sm">{period}</span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-green-400" />
                        </div>
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    size="default"
                    className="w-full group"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading || loadingPlan !== null}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Paiement sécurisé par Stripe • Annulation à tout moment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;