import { useState } from "react";
import { Check, Zap, Crown, Rocket, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Parfait pour tester et lancer ta première app",
    icon: Zap,
    monthlyPrice: 29,
    yearlyPrice: Math.round(29 * 12 * 0.81),
    features: [
      "1 app e-commerce générée",
      "Design personnalisable",
      "Fiche produit optimisée",
      "Intégration paiements Stripe",
      "Support par email",
      "Mises à jour incluses",
    ],
    notIncluded: [
      "Multi-produits",
      "Domaine personnalisé",
      "Analytics avancés",
    ],
    popular: false,
    cta: "Commencer à 29€/mois",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les entrepreneurs qui veulent scaler",
    icon: Crown,
    monthlyPrice: 49,
    yearlyPrice: Math.round(49 * 12 * 0.81),
    features: [
      "5 apps e-commerce générées",
      "Multi-produits par app",
      "Design premium personnalisable",
      "Fiches produits optimisées SEO",
      "Intégration paiements Stripe",
      "Domaine personnalisé",
      "Analytics de base",
      "Support prioritaire",
    ],
    notIncluded: [
      "Analytics avancés",
    ],
    popular: true,
    cta: "Essai gratuit 7 jours",
  },
  {
    id: "business",
    name: "Business",
    description: "Pour les pros du dropshipping",
    icon: Rocket,
    monthlyPrice: 79,
    yearlyPrice: Math.round(79 * 12 * 0.81),
    features: [
      "Apps illimitées",
      "Multi-produits illimités",
      "Designs premium exclusifs",
      "Fiches produits IA avancées",
      "Intégration paiements Stripe",
      "Domaines personnalisés illimités",
      "Analytics avancés",
      "A/B Testing intégré",
      "Support VIP 24/7",
      "Formation dropshipping",
    ],
    notIncluded: [],
    popular: false,
    cta: "Passer au Business",
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { createCheckout, subscribed, planName } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      // Store the selected plan and redirect to auth
      sessionStorage.setItem("selectedPlan", JSON.stringify({ planId, isYearly }));
      navigate("/auth");
      return;
    }

    // User is logged in, create checkout session
    setLoadingPlan(planId);
    try {
      await createCheckout(planId, isYearly);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Tarifs simples et transparents</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Choisis ta formule{" "}
              <span className="text-gradient">et lance ton business</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Colle un lien AliExpress, reçois une app prête à vendre. Commence dès 29€/mois.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4">
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
                  -19%
                </span>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const period = isYearly ? "/an" : "/mois";
              const isLoading = loadingPlan === plan.id;
              const isCurrentPlan = subscribed && planName?.toLowerCase() === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                      : "border-border/50 bg-card/50"
                  } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg">
                        POPULAIRE
                      </div>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0">
                      <div className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-br-lg">
                        VOTRE PLAN
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.popular ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-6">
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{price}€</span>
                      <span className="text-muted-foreground">{period}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 opacity-50">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="w-2 h-0.5 bg-muted-foreground rounded" />
                          </div>
                          <span className="text-sm line-through">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      variant={plan.popular ? "hero" : "outline"}
                      size="lg"
                      className="w-full group"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isLoading || loadingPlan !== null || isCurrentPlan}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Plan actuel"
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

          {/* FAQ or Trust badges */}
          <div className="mt-20 text-center">
            <p className="text-muted-foreground mb-6">
              Paiement sécurisé par Stripe • Annulation à tout moment • Support réactif
            </p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <span className="text-sm font-medium">Visa</span>
              <span className="text-sm font-medium">Mastercard</span>
              <span className="text-sm font-medium">American Express</span>
              <span className="text-sm font-medium">Apple Pay</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
