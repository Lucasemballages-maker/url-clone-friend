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
    <div className="max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>

      {/* Success Message */}
      <h1 className="text-3xl font-bold mb-3">
        Votre boutique est prête ! 🎉
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        L'IA a généré votre boutique <strong>{storeData.storeName}</strong> avec succès.
      </p>

      {/* Store URL Card */}
      <div className="glass rounded-2xl p-6 border-gradient mb-8">
        <p className="text-sm text-muted-foreground mb-3">Lien de votre boutique</p>
        <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
          <Rocket className="w-5 h-5 text-primary" />
          <span className="flex-1 font-medium truncate text-left">{storeUrl}</span>
          <Button variant="ghost" size="icon" onClick={copyUrl}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 border-gradient">
          <div className="text-2xl font-bold text-primary mb-1">1</div>
          <div className="text-xs text-muted-foreground">Produit</div>
        </div>
        <div className="glass rounded-xl p-4 border-gradient">
          <div className="text-2xl font-bold text-primary mb-1">{storeData.productImages.length}</div>
          <div className="text-xs text-muted-foreground">Images</div>
        </div>
        <div className="glass rounded-xl p-4 border-gradient">
          <div className="text-2xl font-bold text-green-500 mb-1">✓</div>
          <div className="text-xs text-muted-foreground">Optimisée</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="hero"
          size="xl"
          className="flex-1 gap-2"
          onClick={() => window.open(storeUrl, "_blank")}
        >
          <ExternalLink className="w-5 h-5" />
          Voir ma boutique
        </Button>
        <Button variant="outline" size="xl" className="flex-1 gap-2">
          <Download className="w-5 h-5" />
          Exporter le thème
        </Button>
      </div>

      {/* Continue Button */}
      <div className="mt-8 pt-8 border-t border-border">
        <Button
          onClick={onFinish}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Créer une autre boutique
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-6 mt-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour aux modifications
        </Button>
      </div>
    </div>
  );
};

export default Step4Finaliser;
