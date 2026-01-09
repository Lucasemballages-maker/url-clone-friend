import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Link as LinkIcon, 
  Wand2, 
  Rocket, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  Smartphone,
  Palette,
  Type,
  Image,
  ExternalLink,
  Copy,
  Clock,
  Zap,
  ShoppingBag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, title: "Colle ton lien", icon: LinkIcon },
  { id: 2, title: "L'IA analyse", icon: Wand2 },
  { id: 3, title: "Génération", icon: Sparkles },
  { id: 4, title: "App prête", icon: Rocket },
];

const recentApps = [
  { name: "TechWatch Pro", product: "Smart Watch", date: "Il y a 2h", status: "active" },
  { name: "BeautyGlow Store", product: "Sérum Visage", date: "Hier", status: "active" },
];

const Dashboard = () => {
  const [productUrl, setProductUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const { toast } = useToast();

  const isValidAliExpressUrl = (url: string) => {
    return url.includes("aliexpress") || url.includes("ali");
  };

  const handleGenerate = async () => {
    if (!productUrl) {
      toast({
        title: "Lien requis",
        description: "Colle un lien AliExpress pour générer ton app",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAliExpressUrl(productUrl)) {
      toast({
        title: "Lien invalide",
        description: "Merci de coller un lien AliExpress valide",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setCurrentStep(1);
    
    // Simulate AI generation steps
    setTimeout(() => setCurrentStep(2), 1500);
    setTimeout(() => setCurrentStep(3), 3000);
    setTimeout(() => {
      setCurrentStep(4);
      setIsGenerating(false);
      setGeneratedApp({
        name: "SmartWatch Store",
        product: "Smart Watch Pro Max",
        price: "49.99",
        originalPrice: "89.99",
        discount: "44%",
        appUrl: "https://smartwatch.copyfy.app",
      });
      toast({
        title: "App générée ! 🎉",
        description: "Ton application e-commerce est prête",
      });
    }, 4500);
  };

  const copyAppUrl = () => {
    if (generatedApp?.appUrl) {
      navigator.clipboard.writeText(generatedApp.appUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien de ton app a été copié",
      });
    }
  };

  const resetForm = () => {
    setGeneratedApp(null);
    setProductUrl("");
    setCurrentStep(0);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-3xl">
            {!generatedApp ? (
              <>
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-gradient mb-6">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Génération IA</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Crée ton app e-commerce
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                    Colle le lien d'un produit AliExpress et reçois une application 
                    prête à vendre en moins de 2 minutes.
                  </p>
                </div>

                {/* Steps indicator */}
                {isGenerating && (
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        const isCurrent = currentStep === step.id;
                        
                        return (
                          <div key={step.id} className="flex items-center">
                            <div className={`
                              flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all
                              ${isCurrent ? "bg-primary text-primary-foreground" : 
                                isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}
                            `}>
                              {isCurrent && isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isActive && currentStep > step.id ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">{step.title}</span>
                            </div>
                            {index < steps.length - 1 && (
                              <div className={`w-6 h-0.5 mx-1 ${currentStep > step.id ? "bg-primary" : "bg-border"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Input Card */}
                <div className="glass rounded-2xl p-8 border-gradient">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Lien du produit AliExpress
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="https://fr.aliexpress.com/item/..."
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          className="pl-12 h-14 text-lg bg-secondary border-border rounded-xl"
                          disabled={isGenerating}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleGenerate();
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        Colle le lien complet du produit que tu veux vendre
                      </p>
                    </div>

                    <Button
                      variant="hero"
                      size="xl"
                      className="w-full h-14 text-lg gap-3"
                      onClick={handleGenerate}
                      disabled={!productUrl || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Générer mon app e-commerce
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Prêt en 2 min</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Palette className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Design pro</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">Paiements intégrés</p>
                    </div>
                  </div>
                </div>

                {/* Recent Apps */}
                {recentApps.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Tes apps récentes</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {recentApps.map((app, i) => (
                        <div key={i} className="glass rounded-xl p-4 border-gradient flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{app.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{app.product}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Active
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">{app.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Generated App Result */
              <div className="space-y-8">
                {/* Success Header */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">Ton app est prête ! 🎉</h1>
                  <p className="text-lg text-muted-foreground">
                    L'IA a généré ton application e-commerce complète
                  </p>
                </div>

                {/* App URL Card */}
                <div className="glass rounded-2xl p-6 border-gradient">
                  <p className="text-sm text-muted-foreground mb-3">Lien de ton app</p>
                  <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <span className="flex-1 font-medium truncate">{generatedApp.appUrl}</span>
                    <Button variant="ghost" size="icon" onClick={copyAppUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={generatedApp.appUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="glass rounded-2xl overflow-hidden border-gradient">
                  <div className="bg-secondary/50 p-4 flex items-center gap-4 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-muted px-4 py-1.5 rounded-lg text-xs text-muted-foreground">
                        {generatedApp.appUrl}
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary rounded-xl flex items-center justify-center">
                        <Image className="w-16 h-16 text-primary/30" />
                      </div>
                      <div>
                        <span className="text-xs text-primary font-medium uppercase tracking-wider">
                          Best-seller
                        </span>
                        <h3 className="text-2xl font-bold mt-2 mb-4">{generatedApp.product}</h3>
                        <p className="text-muted-foreground mb-6">
                          Description optimisée par l'IA pour maximiser les conversions...
                        </p>
                        <div className="flex items-center gap-4 mb-6">
                          <span className="text-3xl font-bold">€{generatedApp.price}</span>
                          <span className="text-lg text-muted-foreground line-through">€{generatedApp.originalPrice}</span>
                          <span className="px-2 py-1 bg-green-500/20 text-green-500 text-sm rounded-lg font-medium">
                            -{generatedApp.discount}
                          </span>
                        </div>
                        <Button variant="hero" size="lg" className="w-full">
                          Ajouter au panier
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-5 card-hover border-gradient cursor-pointer group text-center">
                    <Palette className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Couleurs</p>
                  </div>
                  <div className="glass rounded-xl p-5 card-hover border-gradient cursor-pointer group text-center">
                    <Type className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Textes</p>
                  </div>
                  <div className="glass rounded-xl p-5 card-hover border-gradient cursor-pointer group text-center">
                    <Image className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Images</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero" size="xl" className="flex-1 gap-2" asChild>
                    <a href={generatedApp.appUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5" />
                      Voir mon app en ligne
                    </a>
                  </Button>
                  <Button variant="outline" size="xl" className="flex-1" onClick={resetForm}>
                    Créer une autre app
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
