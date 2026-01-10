import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Plus, 
  ExternalLink, 
  MoreVertical, 
  Eye,
  Pencil,
  Trash2,
  Copy,
  Loader2,
  Pause,
  Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StoreData } from "@/types/store";

interface DeployedStore {
  id: string;
  subdomain: string;
  store_data: StoreData;
  status: string;
  visits: number;
  orders: number;
  created_at: string;
  stripe_api_key: string | null;
  payment_url: string | null;
}

const MyApps = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stores, setStores] = useState<DeployedStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchStores();
    }
  }, [user, authLoading]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from("deployed_stores")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedStores = (data || []).map(store => ({
        ...store,
        store_data: store.store_data as unknown as StoreData,
      }));

      setStores(typedStores);
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (subdomain: string) => {
    const url = `${window.location.origin}/store/${subdomain}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié !",
      description: "Le lien de la boutique a été copié",
    });
  };

  const toggleStatus = async (store: DeployedStore) => {
    const newStatus = store.status === "active" ? "paused" : "active";
    try {
      const { error } = await supabase
        .from("deployed_stores")
        .update({ status: newStatus })
        .eq("id", store.id);

      if (error) throw error;

      setStores(prev => prev.map(s => 
        s.id === store.id ? { ...s, status: newStatus } : s
      ));

      toast({
        title: newStatus === "active" ? "Boutique activée" : "Boutique en pause",
      });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de modifier le status", variant: "destructive" });
    }
  };

  const deleteStore = async (storeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) return;

    try {
      const { error } = await supabase
        .from("deployed_stores")
        .delete()
        .eq("id", storeId);

      if (error) throw error;

      setStores(prev => prev.filter(s => s.id !== storeId));
      toast({ title: "Boutique supprimée" });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mes boutiques</h1>
            <p className="text-muted-foreground">Gérez vos boutiques déployées sur Dropyfy</p>
          </div>
          <Button variant="hero" className="gap-2" asChild>
            <Link to="/dashboard">
              <Plus className="w-4 h-4" />
              Créer une boutique
            </Link>
          </Button>
        </div>

        {/* Stores Grid */}
        {stores.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="glass rounded-xl border-gradient overflow-hidden card-hover">
                {/* Preview */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center relative">
                  {store.store_data.productImages?.[0] ? (
                    <img 
                      src={store.store_data.productImages[0]} 
                      alt={store.store_data.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Smartphone className="w-12 h-12 text-primary/30" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${store.status === "active" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-yellow-500/20 text-yellow-500"}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${store.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                      {store.status === "active" ? "Active" : "Pause"}
                    </span>
                  </div>
                </div>

                {/* Payment Status Badge */}
                <div className="mb-3">
                  {store.stripe_api_key || store.payment_url ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      💳 Paiements activés
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      ⚠️ Paiements non configurés
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{store.store_data.productName || "Boutique"}</h3>
                      <p className="text-sm text-muted-foreground truncate">{store.subdomain}.dropyfy.io</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir la boutique
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyUrl(store.subdomain)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/apps/${store.id}/edit`)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleStatus(store)}>
                          {store.status === "active" ? (
                            <><Pause className="w-4 h-4 mr-2" />Mettre en pause</>
                          ) : (
                            <><Play className="w-4 h-4 mr-2" />Activer</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => deleteStore(store.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{store.visits} vues</span>
                    <span>•</span>
                    <span>{store.orders} commandes</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}>
                      <ExternalLink className="w-3 h-3" />
                      Ouvrir
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/dashboard/apps/${store.id}/edit`)}>
                      Modifier
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Créée le {new Date(store.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass rounded-2xl p-12 border-gradient text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucune boutique créée</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crée ta première boutique e-commerce en collant un lien AliExpress. 
              L'IA génère tout pour toi en moins de 2 minutes.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">
                <Plus className="w-5 h-5 mr-2" />
                Créer ma première boutique
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApps;
