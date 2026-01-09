import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink, 
  Copy, 
  Download,
  Rocket,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StorePreview from "./StorePreview";

interface StoreData {
  storeName: string;
  productName: string;
  productPrice: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  productImages: string[];
  primaryColor: string;
  announcementBar: string;
}

interface Step4FinaliserProps {
  storeData: StoreData;
  storeUrl: string;
  onBack: () => void;
  onFinish: () => void;
}

export const Step4Finaliser = ({
  storeData,
  storeUrl,
  onBack,
  onFinish,
}: Step4FinaliserProps) => {
  const { toast } = useToast();

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    toast({
      title: "Lien copié !",
      description: "Le lien de votre boutique a été copié dans le presse-papier",
    });
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-200px)]">
      {/* Left Panel - Success Info */}
      <div className="w-96 shrink-0 flex flex-col">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold mb-2">
          Votre boutique est prête ! 🎉
        </h1>
        <p className="text-muted-foreground mb-6">
          L'IA a généré votre boutique <strong>{storeData.storeName}</strong> avec succès.
        </p>

        {/* Store URL Card */}
        <div className="glass rounded-xl p-4 border-gradient mb-6">
          <p className="text-xs text-muted-foreground mb-2">Lien de votre boutique</p>
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="flex-1 text-sm font-medium truncate">{storeUrl}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyUrl}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-lg p-3 border-gradient text-center">
            <div className="text-xl font-bold text-primary">1</div>
            <div className="text-xs text-muted-foreground">Produit</div>
          </div>
          <div className="glass rounded-lg p-3 border-gradient text-center">
            <div className="text-xl font-bold text-primary">{storeData.productImages.length}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
          <div className="glass rounded-lg p-3 border-gradient text-center">
            <div className="text-xl font-bold text-green-500">✓</div>
            <div className="text-xs text-muted-foreground">Optimisée</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Button
            variant="hero"
            size="lg"
            className="gap-2"
            onClick={() => window.open(storeUrl, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Voir ma boutique
          </Button>
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter le thème
          </Button>
        </div>

        {/* Continue Button */}
        <div className="pt-4 border-t border-border">
          <Button onClick={onFinish} variant="ghost" className="gap-2 w-full">
            <Sparkles className="w-4 h-4" />
            Créer une autre boutique
          </Button>
        </div>

        {/* Navigation */}
        <div className="mt-auto pt-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux modifications
          </Button>
        </div>
      </div>

      {/* Right Panel - Store Preview */}
      <div className="flex-1 overflow-auto rounded-xl border border-border">
        <StorePreview storeData={storeData} />
      </div>
    </div>
  );
};

export default Step4Finaliser;
