import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Link as LinkIcon, 
  Wand2, 
  Upload, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  Store,
  Palette,
  Type,
  Image
} from "lucide-react";

const steps = [
  { id: 1, title: "Colle ton lien", description: "Lien AliExpress ou Shopify", icon: LinkIcon },
  { id: 2, title: "L'IA génère", description: "Création automatique", icon: Wand2 },
  { id: 3, title: "Personnalise", description: "Ajuste à ton goût", icon: Palette },
  { id: 4, title: "Exporte", description: "Import vers Shopify", icon: Upload },
];

const GenerateStore = () => {
  const [productUrl, setProductUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedStore, setGeneratedStore] = useState<any>(null);

  const handleGenerate = async () => {
    if (!productUrl) return;
    
    setIsGenerating(true);
    setCurrentStep(1);
    
    // Simulate AI generation steps
    setTimeout(() => setCurrentStep(2), 1500);
    setTimeout(() => setCurrentStep(3), 3000);
    setTimeout(() => {
      setCurrentStep(4);
      setIsGenerating(false);
      setGeneratedStore({
        name: "Ma Boutique",
        product: "Smart Watch Pro",
        theme: "Moderne",
        colors: ["#3B82F6", "#1E293B", "#FFFFFF"],
      });
    }, 4500);
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
            Génère ta boutique en quelques secondes
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Colle simplement le lien d'un produit AliExpress ou d'une boutique Shopify. 
            Notre IA s'occupe du reste : images, descriptions, design.
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
        {!generatedStore && (
          <div className="glass rounded-2xl p-8 border-gradient max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Lien du produit
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="https://aliexpress.com/item/... ou https://myshop.myshopify.com/..."
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="pl-10 h-12 bg-secondary border-border"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supporte: AliExpress, Amazon, Shopify, et plus
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
                    Générer ma boutique
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Generated Store Preview */}
        {generatedStore && (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="glass rounded-2xl p-6 border-gradient text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ta boutique est prête ! 🎉</h2>
              <p className="text-muted-foreground">
                L'IA a généré ta boutique en moins de 5 secondes.
              </p>
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
                    <Store className="w-3 h-3" />
                    maboutique.myshopify.com
                  </div>
                </div>
              </div>

              {/* Store Preview */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-secondary to-muted rounded-xl flex items-center justify-center">
                    <Image className="w-16 h-16 text-muted-foreground/30" />
                  </div>

                  {/* Product Info */}
                  <div>
                    <span className="text-xs text-primary font-medium uppercase tracking-wider">
                      Nouveau
                    </span>
                    <h3 className="text-2xl font-bold mt-2 mb-4">{generatedStore.product}</h3>
                    <p className="text-muted-foreground mb-6">
                      Description générée par l'IA : Découvrez notre produit innovant qui combine qualité premium et design moderne pour une expérience utilisateur exceptionnelle.
                    </p>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-3xl font-bold">€49,99</span>
                      <span className="text-lg text-muted-foreground line-through">€79,99</span>
                      <span className="px-2 py-1 bg-success/20 text-success text-sm rounded-lg font-medium">
                        -38%
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
                <p className="text-sm text-muted-foreground">Personnalise les couleurs</p>
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
              <Button variant="hero" size="xl" className="gap-2">
                <Upload className="w-5 h-5" />
                Exporter vers Shopify
              </Button>
              <Button 
                variant="hero-outline" 
                size="xl"
                onClick={() => {
                  setGeneratedStore(null);
                  setProductUrl("");
                  setCurrentStep(0);
                }}
              >
                Générer une autre boutique
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GenerateStore;
