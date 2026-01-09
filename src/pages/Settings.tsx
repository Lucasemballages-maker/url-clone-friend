import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  CreditCard, 
  LogOut, 
  Calendar,
  Crown,
  Loader2,
  ExternalLink,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { user, signOut } = useAuth();
  const { subscribed, planName, subscriptionEnd, loading: isLoading, checkSubscription, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  
  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const handleChangePassword = async () => {
    setPasswordError(null);
    
    const validation = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!validation.success) {
      setPasswordError(validation.error.errors[0].message);
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le mot de passe",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Se déconnecter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sécurité
          </h2>
          <div className="bg-card rounded-xl border border-border p-4 space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <Button 
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isChangingPassword ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Modifier le mot de passe
            </Button>
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
