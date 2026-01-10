import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2, PartyPopper, FileArchive, Mail, CheckCircle } from "lucide-react";
import StorePreview from "./StorePreview";
import { StoreData } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { generateStoreZip, downloadZip } from "@/lib/zip-generator";
import { toast } from "sonner";

interface Step4FinaliserProps {
  storeData: StoreData;
  storeUrl: string;
  onBack: () => void;
  onFinish: () => void;
}

interface DownloadResult {
  success: boolean;
  filename: string;
}

export const Step4Finaliser = ({
  storeData,
  onBack,
  onFinish,
}: Step4FinaliserProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null);

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    
    try {
      toast.info("Génération en cours...", { 
        description: "Préparation de votre site et des images..." 
      });
      
      const result = await generateStoreZip(storeData);
      downloadZip(result);
      
      setDownloadResult({
        success: true,
        filename: result.filename
      });

      toast.success("✅ Téléchargement réussi !", {
        description: `${result.filename} a été téléchargé`,
        duration: 5000,
      });
      
    } catch (error) {
      console.error("Error generating ZIP:", error);
      toast.error("Erreur lors de la génération", {
        description: error instanceof Error ? error.message : "Veuillez réessayer",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Show success screen after download
  if (downloadResult) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <PartyPopper className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">✅ Votre site est prêt !</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Le fichier <strong>{downloadResult.filename}</strong> a été téléchargé. 
          Suivez les instructions du PDF inclus pour configurer votre boutique Shopify.
        </p>
        
        <Card className="w-full max-w-md mb-6">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm mb-3">Contenu du ZIP :</h3>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileArchive className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">index.html</p>
                <p className="text-xs text-muted-foreground">Page de vente complète</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileArchive className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">/images/</p>
                <p className="text-xs text-muted-foreground">Images du produit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileArchive className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">INSTRUCTIONS.pdf</p>
                <p className="text-xs text-muted-foreground">Guide en 4 étapes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-md mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Prochaines étapes
            </h3>
            <ol className="text-left text-sm space-y-2 text-muted-foreground">
              <li>1. Créez votre produit sur Shopify</li>
              <li>2. Obtenez votre Storefront API token</li>
              <li>3. Remplacez les 3 PLACEHOLDER dans le HTML</li>
              <li>4. Publiez sur Shopify ou votre hébergeur</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onFinish}>
            Créer un autre site
          </Button>
          <Button variant="hero" onClick={handleDownloadZip}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger à nouveau
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Store Preview - Full Width */}
      <div className="flex-1 overflow-auto rounded-xl border border-border mb-6">
        <StorePreview storeData={storeData} />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-muted-foreground hidden sm:block">
            <p>Site prêt à exporter</p>
            <p className="text-xs">ZIP avec HTML + Images + Guide</p>
          </div>
          
          <Button 
            variant="hero" 
            size="xl" 
            className="gap-3" 
            onClick={handleDownloadZip}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Télécharger mon site
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4Finaliser;
