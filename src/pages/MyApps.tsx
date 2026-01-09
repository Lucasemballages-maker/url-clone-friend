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
  Copy
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const apps = [
  { 
    id: 1,
    name: "TechWatch Pro", 
    product: "Smart Watch Ultra", 
    url: "https://techwatch.dropyfy.app",
    createdAt: "Il y a 2 heures",
    status: "active",
    views: 234,
    orders: 12
  },
  { 
    id: 2,
    name: "BeautyGlow Store", 
    product: "Sérum Anti-âge", 
    url: "https://beautyglow.dropyfy.app",
    createdAt: "Hier",
    status: "active",
    views: 567,
    orders: 23
  },
  { 
    id: 3,
    name: "FitPro Shop", 
    product: "Bandes de résistance", 
    url: "https://fitpro.dropyfy.app",
    createdAt: "Il y a 3 jours",
    status: "draft",
    views: 89,
    orders: 3
  },
];

const MyApps = () => {
  const { toast } = useToast();

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié !",
      description: "Le lien de l'app a été copié",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Mes apps</h1>
            <p className="text-muted-foreground">Gère tes applications e-commerce</p>
          </div>
          <Button variant="hero" className="gap-2" asChild>
            <Link to="/dashboard">
              <Plus className="w-4 h-4" />
              Créer une app
            </Link>
          </Button>
        </div>

        {/* Apps Grid */}
        {apps.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="glass rounded-xl border-gradient overflow-hidden card-hover">
                {/* Preview */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary flex items-center justify-center relative">
                  <Smartphone className="w-12 h-12 text-primary/30" />
                  <div className="absolute top-3 right-3">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${app.status === "active" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-yellow-500/20 text-yellow-500"}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${app.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                      {app.status === "active" ? "Active" : "Brouillon"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{app.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{app.product}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={app.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir l'app
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyUrl(app.url)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{app.views} vues</span>
                    <span>•</span>
                    <span>{app.orders} commandes</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" asChild>
                      <a href={app.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                        Ouvrir
                      </a>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      Modifier
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">{app.createdAt}</p>
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
            <h2 className="text-xl font-semibold mb-2">Aucune app créée</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crée ta première app e-commerce en collant un lien AliExpress. 
              L'IA génère tout pour toi en moins de 2 minutes.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard">
                <Plus className="w-5 h-5 mr-2" />
                Créer ma première app
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApps;
