import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Info,
  Package,
  Layout,
  Image,
  ThumbsUp,
  RefreshCw,
  Star,
  HelpCircle,
  ShoppingCart,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
}

const sections: Section[] = [
  { id: "product-info", title: "Informations sur le produit", icon: Info },
  { id: "product-section", title: "Section Produit", icon: Package },
  { id: "image-text", title: "Section image avec texte", icon: Image },
  { id: "difference", title: "Ce qui rend notre site différent", icon: ThumbsUp },
  { id: "clinical", title: "Section clinique", icon: RefreshCw },
  { id: "reviews", title: "Évaluation", icon: Star },
  { id: "faq", title: "FAQs", icon: HelpCircle },
];

type TabId = "product" | "home" | "styles";

interface Step3PersonnaliserProps {
  storeData: StoreData;
  setStoreData: (data: StoreData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3Personnaliser = ({
  storeData,
  setStoreData,
  onBack,
  onNext,
}: Step3PersonnaliserProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("product");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState("product");

  const tabs = [
    { id: "product" as TabId, label: "Page de produit" },
    { id: "home" as TabId, label: "Page d'accueil" },
    { id: "styles" as TabId, label: "Styles" },
  ];

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Left Panel - Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Warning Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠</span>
          <div className="flex-1">
            <p className="text-sm text-amber-200">
              <strong>Remarque:</strong> Une fois votre thème mis à jour sur Shopify, vous pouvez le personnaliser et l'optimiser pour qu'il corresponde parfaitement à votre marque.
            </p>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all text-left group"
              >
                <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="flex-1 font-medium">{section.title}</span>
                <ChevronRight className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  activeSection === section.id && "rotate-90"
                )} />
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-border mt-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <Button onClick={onNext} className="gap-2 bg-primary hover:bg-primary/90">
            Suivant
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-[380px] flex flex-col shrink-0">
        {/* Preview Header */}
        <div className="flex items-center justify-between mb-4">
          <Select value={previewPage} onValueChange={setPreviewPage}>
            <SelectTrigger className="w-[160px] h-9 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product">Page de produit</SelectItem>
              <SelectItem value="home">Page d'accueil</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Voir la boutique
          </Button>
        </div>

        {/* Phone Preview Frame */}
        <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden">
          {/* Announcement Bar */}
          <div className="bg-blue-600 text-white text-xs text-center py-2 px-4 flex items-center justify-between">
            <button className="text-white/70 hover:text-white">‹</button>
            <span>{storeData.announcementBar}</span>
            <button className="text-white/70 hover:text-white">›</button>
          </div>

          {/* Store Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold">{storeData.storeName.toLowerCase()}</span>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Product Content */}
          <div className="overflow-y-auto max-h-[500px]">
            {/* Product Image */}
            <div className="aspect-square bg-secondary relative">
              {storeData.productImages[0] ? (
                <img
                  src={storeData.productImages[0]}
                  alt={storeData.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Product Thumbnails */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              {storeData.productImages.slice(0, 5).map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0",
                    i === 0 ? "border-primary" : "border-transparent"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-center gap-1 mb-2">
                <div className="flex text-yellow-400">
                  {"★★★★★".split("").map((star, i) => (
                    <span key={i}>{star}</span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Noté {storeData.rating} ({storeData.reviews}+ clients satisfaits)
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">{storeData.productName}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Description du produit générée par l'IA pour maximiser les conversions...
              </p>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold">{storeData.productPrice}€</span>
                <span className="text-lg text-muted-foreground line-through">{storeData.originalPrice}€</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-md font-medium">
                  -30%
                </span>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Acheter maintenant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Personnaliser;
