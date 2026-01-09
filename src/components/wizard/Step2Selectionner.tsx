import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Check, Wand2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onGenerateAiImage: () => void;
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

      {/* AI Image Generation Button */}
      <div className="mb-8">
        <button
          onClick={onGenerateAiImage}
          disabled={isGeneratingImage}
          className="w-full p-6 border-2 border-dashed border-primary/50 rounded-xl hover:bg-primary/5 transition-colors flex items-center justify-center gap-3 text-primary"
        >
          {isGeneratingImage ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Générer une image avec l'IA</span>
            </>
          )}
        </button>
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
