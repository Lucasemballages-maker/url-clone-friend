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
import StorePreview from "./StorePreview";
import StoreHomePreview from "./StoreHomePreview";
import { StoreData } from "@/types/store";

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
      <div className="flex-1 flex flex-col min-w-0">
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

        {/* Store Preview */}
        <div className="flex-1 overflow-auto rounded-xl border border-border bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center py-6">
          {previewPage === "product" ? (
            <StorePreview storeData={storeData} />
          ) : (
            <StoreHomePreview storeData={storeData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3Personnaliser;
