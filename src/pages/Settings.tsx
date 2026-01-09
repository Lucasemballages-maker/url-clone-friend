import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  User, 
  CreditCard, 
  LogOut, 
  Mail,
  Calendar,
  Crown,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { subscribed, planName, subscriptionEnd, loading: isLoading, checkSubscription, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le portail de gestion",
        variant: "destructive",
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre compte et votre abonnement
          </p>
        </div>

        {/* Account Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Compte
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.email || "—"}</p>
                <p className="text-sm text-muted-foreground">
                  Membre depuis {user?.created_at ? formatDate(user.created_at) : "—"}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Abonnement
          </h2>
          <div className="bg-card rounded-xl border border-border p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : subscribed ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Abonnement actif</p>
                    <p className="text-sm text-muted-foreground">
                      Plan {planName || "Premium"}
                    </p>
                  </div>
                  <span className="ml-auto px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                    Actif
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Renouvellement :</span>
                  </div>
                  <p className="text-sm text-right">
                    {formatDate(subscriptionEnd)}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={isPortalLoading}
                  >
                    {isPortalLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Gérer mon abonnement
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Pour annuler, contactez-nous à support@dropyfy.com
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">Aucun abonnement actif</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Souscrivez pour accéder à toutes les fonctionnalités
                </p>
                <Button 
                  variant="hero"
                  onClick={() => navigate("/pricing")}
                >
                  Voir les offres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
