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
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Colle ton lien", description: "Lien AliExpress", icon: LinkIcon },
  { id: 2, title: "L'IA génère", description: "Création automatique", icon: Wand2 },
  { id: 3, title: "Personnalise", description: "Ajuste à ton goût", icon: Palette },
  { id: 4, title: "Publie", description: "Lance ton app", icon: Rocket },
];

const GenerateStore = () => {
  const [productUrl, setProductUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const { toast } = useToast();

  const isValidAliExpressUrl = (url: string) => {
    return url.includes("aliexpress.com") || url.includes("aliexpress.ru") || url.includes("a]li");
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
    setTimeout(() => setCurrentStep(2), 2000);
    setTimeout(() => setCurrentStep(3), 4000);
    setTimeout(() => {
      setCurrentStep(4);
      setIsGenerating(false);
      setGeneratedApp({
        name: "SmartWatch Store",
        product: "Smart Watch Pro Max",
        price: "49.99",
        originalPrice: "89.99",
        discount: "44%",
        appUrl: "https://smartwatch.dropyfy.app",
        theme: "Moderne",
        colors: ["#3B82F6", "#1E293B", "#FFFFFF"],
      });
      toast({
        title: "App générée ! 🎉",
        description: "Ton application e-commerce est prête",
      });
    }, 6000);
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-gradient mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Propulsé par l'IA</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Génère ton app depuis AliExpress
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Colle le lien d'un produit AliExpress. Notre IA crée une application 
            e-commerce complète, prête à recevoir des commandes.
          </p>
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 sm:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex flex-col items-center gap-2
                    ${isActive ? "text-primary" : "text-muted-foreground"}
                  `}>
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center transition-all
                      ${isCurrent ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30" : 
                        isActive ? "bg-primary/20 text-primary" : "bg-secondary"}
                    `}>
                      {isActive && currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent && isGenerating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs font-medium">{step.title}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-8 sm:w-16 h-0.5 mx-1 sm:mx-2
                      ${currentStep > step.id ? "bg-primary" : "bg-border"}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        {!generatedApp && (
          <div className="glass rounded-2xl p-8 border-gradient max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lien du produit AliExpress
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="https://fr.aliexpress.com/item/..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="pl-10 h-12 bg-secondary border-border"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Colle le lien complet du produit AliExpress que tu veux vendre
                </p>
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full gap-2"
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
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Generated App Preview */}
        {generatedApp && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="glass rounded-2xl p-6 border-gradient text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ton app est prête ! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                L'IA a généré ton application e-commerce complète
              </p>
              
              {/* App URL */}
              <div className="flex items-center justify-center gap-2 bg-secondary rounded-lg px-4 py-3 max-w-md mx-auto">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{generatedApp.appUrl}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyAppUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={generatedApp.appUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-2xl overflow-hidden border-gradient">
              {/* Browser Header */}
              <div className="bg-secondary/50 p-4 flex items-center gap-4 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-muted px-4 py-1.5 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    {generatedApp.appUrl}
                  </div>
                </div>
              </div>

              {/* App Preview */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary rounded-xl flex items-center justify-center">
                    <Image className="w-16 h-16 text-primary/30" />
                  </div>

                  {/* Product Info */}
                  <div>
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      Best-seller
                    </span>
                    <h3 className="text-2xl font-bold mt-2 mb-4">{generatedApp.product}</h3>
                    <p className="text-muted-foreground mb-6">
                      Montre connectée premium avec suivi fitness, notifications intelligentes, 
                      design élégant et autonomie exceptionnelle. Parfaite pour le quotidien.
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
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6 card-hover border-gradient cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Couleurs</h3>
                <p className="text-sm text-muted-foreground">Change les couleurs de ton app</p>
              </div>
              <div className="glass rounded-xl p-6 card-hover border-gradient cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Type className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Textes</h3>
                <p className="text-sm text-muted-foreground">Modifie les descriptions</p>
              </div>
              <div className="glass rounded-xl p-6 card-hover border-gradient cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Image className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Images</h3>
                <p className="text-sm text-muted-foreground">Change les visuels</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" className="gap-2" asChild>
                <a href={generatedApp.appUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5" />
                  Voir mon app en ligne
                </a>
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                onClick={() => {
                  setGeneratedApp(null);
                  setProductUrl("");
                  setCurrentStep(0);
                }}
              >
                Générer une autre app
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GenerateStore;
