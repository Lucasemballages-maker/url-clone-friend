import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StepIndicator from "@/components/wizard/StepIndicator";
import Step1Charger from "@/components/wizard/Step1Charger";
import Step2Selectionner from "@/components/wizard/Step2Selectionner";
import Step3Personnaliser from "@/components/wizard/Step3Personnaliser";
import Step4Finaliser from "@/components/wizard/Step4Finaliser";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { aliexpressApi, AliExpressProduct, ImageStyle } from "@/lib/api/aliexpress";
interface ProductImage {
  id: string;
  url: string;
  isAiGenerated: boolean;
  isSelected: boolean;
}

interface HistoryItem {
  id: string;
  productName: string;
  productUrl: string;
  productImage: string;
  language: string;
  type: string;
  updatedAt: string;
}

import { StoreData } from "@/types/store";

// Simulated history data
const mockHistory: HistoryItem[] = [
  {
    id: "1",
    productName: "Filtre de Douche Purifica...",
    productUrl: "https://fr.aliexpress.com/item/...",
    productImage: "https://ae01.alicdn.com/kf/S6cb2b4b5c3e448bba92d0f0a0c3c6f0aH.jpg",
    language: "fr",
    type: "Boutique",
    updatedAt: "il y a 7 minutes",
  },
];

// Simulated product images from AliExpress scraping
const mockProductImages: ProductImage[] = [
  {
    id: "1",
    url: "https://ae01.alicdn.com/kf/S6cb2b4b5c3e448bba92d0f0a0c3c6f0aH.jpg",
    isAiGenerated: true,
    isSelected: true,
  },
  {
    id: "2",
    url: "https://ae01.alicdn.com/kf/S1234567890abcdef.jpg",
    isAiGenerated: true,
    isSelected: true,
  },
  {
    id: "3",
    url: "https://ae01.alicdn.com/kf/Sabcdef1234567890.jpg",
    isAiGenerated: true,
    isSelected: false,
  },
  {
    id: "4",
    url: "https://ae01.alicdn.com/kf/S0987654321fedcba.jpg",
    isAiGenerated: true,
    isSelected: true,
  },
];

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { toast } = useToast();

  // Step 1 state
  const [productUrl, setProductUrl] = useState("");
  const [language, setLanguage] = useState("fr");
  const [history] = useState<HistoryItem[]>(mockHistory);

  // Step 2 state
  const [storeName, setStoreName] = useState("VOTRE MARQUE");
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Step 3 & 4 state
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "VOTRE MARQUE",
    productName: "Filtre de Douche Purificateur",
    headline: "Une eau pure pour une peau saine",
    description: "Découvrez notre solution innovante pour transformer votre douche quotidienne en moment de bien-être.",
    benefits: ["Qualité premium", "Installation facile", "Garantie 1 an"],
    cta: "Acheter maintenant",
    productPrice: "29.90",
    originalPrice: "49.90",
    rating: "4,8",
    reviews: "21 883",
    productImages: [],
    primaryColor: "#3B82F6",
    announcementBar: "Livraison gratuite sur les commandes supérieures à 50 € | Livraison rapide dans le monde entier",
  });
  const [storeUrl] = useState("https://votre-boutique.lovable.app");

  // Step 1: Generate (extract product data)
  const handleGenerate = async () => {
    if (!productUrl) return;

    setIsLoading(true);
    setLoadingMessage("Extraction des données du produit...");

    try {
      const response = await aliexpressApi.scrapeProduct(productUrl);

      if (!response.success || !response.data) {
        toast({
          title: "Erreur",
          description: response.error || "Impossible d'extraire les données du produit",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const product = response.data;
      
      setLoadingMessage("Reformulation du texte avec l'IA...");
      
      // Reformulate product text with AI
      const reformulateResponse = await aliexpressApi.reformulateProduct(
        product.title,
        product.description,
        language
      );

      const reformulated = reformulateResponse.success && reformulateResponse.data
        ? reformulateResponse.data
        : {
            title: product.title,
            headline: product.title,
            description: product.description || 'Découvrez ce produit exceptionnel.',
            benefits: ['Qualité premium', 'Livraison rapide', 'Satisfaction garantie'],
            cta: 'Acheter maintenant',
          };
      
      setLoadingMessage("Traitement des images...");
      
      // Convert scraped images to ProductImage format
      const scrapedImages: ProductImage[] = product.images.map((url, index) => ({
        id: `scraped-${index}`,
        url,
        isAiGenerated: false,
        isSelected: index < 4, // Select first 4 by default
      }));

      // Auto-generate AI images for different styles
      setLoadingMessage("Génération des images IA...");
      const styles: ImageStyle[] = ['lifestyle', 'studio'];
      const aiImages: ProductImage[] = [];
      
      for (const style of styles) {
        try {
          const aiResponse = await aliexpressApi.generateProductImage(
            scrapedImages[0]?.url || product.images[0],
            reformulated.title,
            style
          );
          
          if (aiResponse.success && aiResponse.data?.imageUrl) {
            aiImages.push({
              id: `ai-${style}-${Date.now()}`,
              url: aiResponse.data.imageUrl,
              isAiGenerated: true,
              isSelected: true,
            });
          }
        } catch (err) {
          console.error(`Error generating ${style} image:`, err);
        }
      }

      const allImages = [...aiImages, ...scrapedImages];
      setProductImages(allImages);
      setStoreName(reformulated.title.split(' ').slice(0, 3).join(' ').toUpperCase());
      setStoreData({
        storeName: reformulated.title.split(' ').slice(0, 3).join(' ').toUpperCase(),
        productName: reformulated.title,
        headline: reformulated.headline,
        description: reformulated.description,
        benefits: reformulated.benefits,
        cta: reformulated.cta,
        productPrice: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating.replace('.', ','),
        reviews: product.reviews,
        productImages: allImages.filter((img) => img.isSelected).map((img) => img.url),
        primaryColor: "#3B82F6",
        announcementBar: "Livraison gratuite sur les commandes supérieures à 50 € | Livraison rapide dans le monde entier",
      });

      setIsLoading(false);
      setCurrentStep(2);
      
      toast({
        title: "Produit extrait !",
        description: `${scrapedImages.length} images et informations récupérées`,
      });
    } catch (error) {
      console.error('Error scraping:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'extraction",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Configure from history
  const handleConfigureHistory = (item: HistoryItem) => {
    setProductUrl(item.productUrl);
    setStoreName(item.productName.replace("...", ""));
    setCurrentStep(2);
    setProductImages(mockProductImages);
  };

  // Toggle image selection
  const toggleImageSelection = (id: string) => {
    setProductImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, isSelected: !img.isSelected } : img
      )
    );
  };

  // Generate AI image
  const handleGenerateAiImage = async (style: ImageStyle = 'lifestyle') => {
    // Find any selected image to use as reference (prefer non-AI images)
    const referenceImage = productImages.find((img) => img.isSelected && !img.isAiGenerated) 
      || productImages.find((img) => img.isSelected);
    
    if (!referenceImage) {
      toast({
        title: "Aucune image de référence",
        description: "Sélectionnez d'abord une image du produit",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Generating AI image with reference:', referenceImage.url, 'style:', style);

    setIsGeneratingImage(true);

    try {
      const response = await aliexpressApi.generateProductImage(
        referenceImage.url,
        storeData.productName,
        style
      );

      if (!response.success || !response.data) {
        toast({
          title: "Erreur",
          description: response.error || "Impossible de générer l'image",
          variant: "destructive",
        });
        setIsGeneratingImage(false);
        return;
      }

      const newImage: ProductImage = {
        id: `ai-${Date.now()}`,
        url: response.data.imageUrl,
        isAiGenerated: true,
        isSelected: true,
      };

      setProductImages((prev) => [newImage, ...prev]);
      
      toast({
        title: "Image générée !",
        description: `Nouvelle image style "${style}" ajoutée`,
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Navigation
  const goToStep = (step: number) => {
    if (step === 3) {
      // Update store data with selected images
      setStoreData((prev) => ({
        ...prev,
        storeName,
        productImages: productImages.filter((img) => img.isSelected).map((img) => img.url),
      }));
    }
    setCurrentStep(step);
  };

  const handleFinish = () => {
    setCurrentStep(1);
    setProductUrl("");
    setStoreName("VOTRE MARQUE");
    setProductImages([]);
  };

  // Loading overlay
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{loadingMessage}</h2>
            <p className="text-muted-foreground">Veuillez patienter...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b border-border bg-card/50 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">📦</span>
              </div>
              <h1 className="text-lg font-semibold">Créez votre boutique avec l'IA</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-pink-400" />
              <span>1/1</span>
              <span className="text-xs">Génération de boutique</span>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="pt-8 px-6">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <Step1Charger
              productUrl={productUrl}
              setProductUrl={setProductUrl}
              language={language}
              setLanguage={setLanguage}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              history={history}
              onConfigureHistory={handleConfigureHistory}
            />
          )}

          {currentStep === 2 && (
            <Step2Selectionner
              storeName={storeName}
              setStoreName={setStoreName}
              productImages={productImages}
              toggleImageSelection={toggleImageSelection}
              onGenerateAiImage={handleGenerateAiImage}
              isGeneratingImage={isGeneratingImage}
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}

          {currentStep === 3 && (
            <Step3Personnaliser
              storeData={storeData}
              setStoreData={setStoreData}
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}

          {currentStep === 4 && (
            <Step4Finaliser
              storeData={storeData}
              storeUrl={storeUrl}
              onBack={() => goToStep(3)}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
