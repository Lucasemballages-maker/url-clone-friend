import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Check, Wand2, ArrowLeft, ArrowRight, Loader2, Home, Camera, Sun, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageStyle } from "@/lib/api/aliexpress";

interface ProductImage {
  id: string;
  url: string;
  isAiGenerated: boolean;
  isSelected: boolean;
}

interface Step2SelectionnerProps {
  storeName: string;
  setStoreName: (name: string) => void;
  productImages: ProductImage[];
  toggleImageSelection: (id: string) => void;
  onGenerateAiImage: (style: ImageStyle) => void;
  isGeneratingImage: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Selectionner = ({
  storeName,
  setStoreName,
  productImages,
  toggleImageSelection,
  onGenerateAiImage,
  isGeneratingImage,
  onBack,
  onNext,
}: Step2SelectionnerProps) => {
  const selectedCount = productImages.filter((img) => img.isSelected).length;
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('lifestyle');

  const imageStyles: { id: ImageStyle; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'lifestyle', label: 'Lifestyle', icon: <Home className="w-4 h-4" />, description: 'Mise en scène réaliste' },
    { id: 'studio', label: 'Studio', icon: <Camera className="w-4 h-4" />, description: 'Fond professionnel' },
    { id: 'outdoor', label: 'Extérieur', icon: <Sun className="w-4 h-4" />, description: 'Décor naturel' },
    { id: 'minimal', label: 'Minimal', icon: <Minimize2 className="w-4 h-4" />, description: 'Style épuré' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Store Name Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Nom de votre boutique (peut être modifié à tout moment)
        </label>
        <Input
          type="text"
          placeholder="VOTRE MARQUE"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="h-12 bg-background border-border rounded-lg text-base uppercase tracking-wide"
        />
      </div>

      {/* AI Image Generation */}
      <div className="mb-8">
        <p className="text-sm font-medium mb-3">Générer une image avec l'IA</p>
        
        {/* Style Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {imageStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all text-left",
                selectedStyle === style.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {style.icon}
                <span className="font-medium text-sm">{style.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{style.description}</p>
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={() => onGenerateAiImage(selectedStyle)}
          disabled={isGeneratingImage || selectedCount === 0}
          className="w-full p-4 border-2 border-dashed border-primary/50 rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-3 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingImage ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Générer une image "{imageStyles.find(s => s.id === selectedStyle)?.label}"</span>
            </>
          )}
        </button>
        {selectedCount === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Sélectionnez au moins une image pour servir de référence
          </p>
        )}
      </div>

      {/* Images Selection */}
      <div className="mb-8">
        <p className="text-sm font-medium mb-2">
          Sélectionnez les images du produit que vous souhaitez ajouter
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Conseil:
          </span>{" "}
          Vous pouvez réorganiser les images en les faisant glisser dans l'ordre de votre choix.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productImages.map((image) => (
            <div
              key={image.id}
              onClick={() => toggleImageSelection(image.id)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                image.isSelected
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-transparent hover:border-primary/50"
              )}
            >
              <img
                src={image.url}
                alt="Product"
                className="w-full h-full object-cover"
              />
              
              {/* AI Generated Badge */}
              {image.isAiGenerated && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </div>
              )}

              {/* Selection Checkbox */}
              <div
                className={cn(
                  "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  image.isSelected
                    ? "bg-primary border-primary"
                    : "bg-background/80 border-white/50"
                )}
              >
                {image.isSelected && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Edit with AI overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <button className="flex items-center gap-1 text-xs text-white/80 hover:text-white">
                  <Wand2 className="w-3 h-3" />
                  Modifier avec IA
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Show more images button */}
        <div className="text-center mt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <span>↓</span>
            Voir plus d'images ({productImages.length})
          </Button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedCount === 0 || !storeName}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          Suivant
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Selectionner;
