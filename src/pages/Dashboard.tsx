import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StepIndicator from "@/components/wizard/StepIndicator";
import Step1Charger from "@/components/wizard/Step1Charger";
import Step2Selectionner from "@/components/wizard/Step2Selectionner";
import Step3Personnaliser from "@/components/wizard/Step3Personnaliser";
import Step4Finaliser from "@/components/wizard/Step4Finaliser";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Image, Wand2, Check } from "lucide-react";
import { aliexpressApi, AliExpressProduct, ImageStyle } from "@/lib/api/aliexpress";
import { Progress } from "@/components/ui/progress";
import { useStoreHistory, HistoryItem } from "@/hooks/useStoreHistory";
import { StoreData } from "@/types/store";

interface ProductImage {
  id: string;
  url: string;
  isAiGenerated: boolean;
  isSelected: boolean;
}

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

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'done';
}

const Dashboard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([]);
  const { toast } = useToast();
  
  // History from database
  const { history, saveConfiguration } = useStoreHistory();

  // Step 1 state
  const [productUrl, setProductUrl] = useState("");
  const [language, setLanguage] = useState("fr");

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
    backgroundColor: "#0F0F0F",
    textColor: "#FFFFFF",
    accentColor: "#F59E0B",
    announcementBar: "Livraison gratuite sur les commandes supérieures à 50 € | Livraison rapide dans le monde entier",
  });
  const [storeUrl] = useState("https://votre-boutique.lovable.app");

  // Step 1: Generate (extract product data)
  const handleGenerate = async () => {
    if (!productUrl) return;

    setIsLoading(true);
    setLoadingProgress(0);
    
    // Initialize loading steps
    const initialSteps: LoadingStep[] = [
      { id: 'scrape', label: 'Extraction des données du produit', status: 'loading' },
      { id: 'reformulate', label: 'Reformulation du texte avec l\'IA', status: 'pending' },
      { id: 'images', label: 'Traitement des images', status: 'pending' },
      { id: 'ai-lifestyle', label: 'Génération image IA Lifestyle', status: 'pending' },
      { id: 'ai-studio', label: 'Génération image IA Studio', status: 'pending' },
    ];
    setLoadingSteps(initialSteps);
    setLoadingMessage("Extraction des données du produit...");

    const updateStep = (stepId: string, status: LoadingStep['status']) => {
      setLoadingSteps(prev => prev.map(s => s.id === stepId ? { ...s, status } : s));
      const stepIndex = initialSteps.findIndex(s => s.id === stepId);
      if (status === 'done') {
        setLoadingProgress(((stepIndex + 1) / initialSteps.length) * 100);
      }
    };

    try {
      const response = await aliexpressApi.scrapeProduct(productUrl);
      updateStep('scrape', 'done');

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
      
      updateStep('reformulate', 'loading');
      setLoadingMessage("Reformulation du texte avec l'IA...");
      
      // Reformulate product text with AI
      const reformulateResponse = await aliexpressApi.reformulateProduct(
        product.title,
        product.description,
        language
      );
      updateStep('reformulate', 'done');

      const reformulated = reformulateResponse.success && reformulateResponse.data
        ? reformulateResponse.data
        : {
            title: product.title,
            headline: product.title,
            description: product.description || 'Découvrez ce produit exceptionnel.',
            benefits: ['Qualité premium', 'Livraison rapide', 'Satisfaction garantie'],
            cta: 'Acheter maintenant',
          };
      
      updateStep('images', 'loading');
      setLoadingMessage("Traitement des images...");
      
      // Convert scraped images to ProductImage format
      const scrapedImages: ProductImage[] = product.images.map((url, index) => ({
        id: `scraped-${index}`,
        url,
        isAiGenerated: false,
        isSelected: index < 4, // Select first 4 by default
      }));
      updateStep('images', 'done');

      // Skip AI image generation - use only real scraped images
      // Mark AI steps as done without generating
      updateStep('ai-lifestyle', 'done');
      updateStep('ai-studio', 'done');

      // Use only scraped images (no AI modifications)
      const allImages = scrapedImages;
      setProductImages(allImages);
      setStoreName(reformulated.title.split(' ').slice(0, 3).join(' ').toUpperCase());
      
      // Calculate displayed price = 2x real price
      const realPrice = parseFloat(product.price) || 29.99;
      const displayedPrice = (realPrice * 2).toFixed(2);
      const displayedOriginalPrice = (realPrice * 3).toFixed(2); // Original = 3x for crossed out price
      
      const newStoreData: StoreData = {
        storeName: reformulated.title.split(' ').slice(0, 3).join(' ').toUpperCase(),
        productName: reformulated.title,
        headline: reformulated.headline,
        description: reformulated.description,
        benefits: reformulated.benefits,
        cta: reformulated.cta,
        productPrice: displayedPrice,
        originalPrice: displayedOriginalPrice,
        rating: product.rating.replace('.', ','),
        reviews: product.reviews,
        productImages: allImages.filter((img) => img.isSelected).map((img) => img.url),
        primaryColor: "#3B82F6",
        backgroundColor: "#0F0F0F",
        textColor: "#FFFFFF",
        accentColor: "#F59E0B",
        announcementBar: "Livraison gratuite sur les commandes supérieures à 50 € | Livraison rapide dans le monde entier",
      };
      
      setStoreData(newStoreData);

      // Save configuration to history
      await saveConfiguration(
        reformulated.title,
        productUrl,
        allImages[0]?.url || "",
        language,
        newStoreData
      );

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
    
    // If we have stored storeData, restore it
    if (item.storeData) {
      setStoreData(item.storeData);
      const restoredImages: ProductImage[] = (item.storeData.productImages || []).map((url, idx) => ({
        id: `restored-${idx}`,
        url,
        isAiGenerated: false,
        isSelected: true,
      }));
      setProductImages(restoredImages);
    }
    
    setCurrentStep(2);
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
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mx-auto mb-6 relative">
                <Wand2 className="w-10 h-10 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Création en cours...</h2>
              <p className="text-muted-foreground">{loadingMessage}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progression</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <Progress value={loadingProgress} className="h-3" />
            </div>

            {/* Steps list */}
            <div className="space-y-3 bg-card/50 rounded-xl p-4 border border-border">
              {loadingSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    step.status === 'loading' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : step.status === 'done' 
                        ? 'bg-green-500/10' 
                        : 'opacity-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {step.status === 'loading' ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : step.status === 'done' ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {step.id.includes('ai') ? (
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Image className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    step.status === 'done' ? 'text-green-500' : 
                    step.status === 'loading' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
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
