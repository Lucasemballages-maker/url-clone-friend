import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, CheckCircle, Link as LinkIcon, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryItem {
  id: string;
  productName: string;
  productUrl: string;
  productImage: string;
  language: string;
  type: string;
  updatedAt: string;
}

interface Step1ChargerProps {
  productUrl: string;
  setProductUrl: (url: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  history: HistoryItem[];
  onConfigureHistory: (item: HistoryItem) => void;
}

export const Step1Charger = ({
  productUrl,
  setProductUrl,
  language,
  setLanguage,
  onGenerate,
  isLoading,
  history,
  onConfigureHistory,
}: Step1ChargerProps) => {
  const isValidUrl = productUrl.includes("aliexpress") || productUrl.includes("ali");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">
          Créez votre boutique en quelques secondes avec{" "}
          <span className="text-primary">CopyfyAI</span>
          <Sparkles className="inline-block w-5 h-5 ml-2 text-primary" />
        </h1>
        <p className="text-muted-foreground">
          Transformez un lien de produit en boutique qui convertie. Collez votre lien{" "}
          <span className="text-orange-500">AliExpress</span> ou{" "}
          <span className="text-amber-500">Amazon</span> ci-dessous, générez et personnalisez.
        </p>
      </div>

      {/* URL Input Section */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Input
            type="url"
            placeholder="https://fr.aliexpress.com/item/1005010620459159.html"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="h-12 pl-4 pr-4 bg-background border-border rounded-lg text-base"
            disabled={isLoading}
          />
        </div>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[140px] h-12 bg-background border-border">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <SelectValue placeholder="Langue" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={onGenerate}
          disabled={!productUrl || isLoading}
          className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Générer
        </Button>
      </div>

      {/* Validation message */}
      {productUrl && (
        <div className="flex items-center gap-2 mb-6">
          {isValidUrl ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">URL de produit valide.</span>
            </>
          ) : (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-orange-500" />
              <span className="text-sm text-orange-500">Collez une URL AliExpress valide</span>
            </>
          )}
        </div>
      )}

      {/* Add to existing theme link */}
      <div className="text-center mb-10">
        <button className="text-primary text-sm hover:underline flex items-center gap-2 mx-auto">
          <LinkIcon className="w-4 h-4" />
          Ajouter une page produit à votre thème existant
        </button>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Historique</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-sm text-muted-foreground">
                  <th className="text-left p-4 font-medium">Les produits</th>
                  <th className="text-left p-4 font-medium">Langue du site</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Dernière mise à jour</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <LinkIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline truncate block max-w-[200px]"
                          >
                            {item.productUrl}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-lg">{item.language === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{item.updatedAt}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConfigureHistory(item)}
                        className="gap-2"
                      >
                        <span>✏️</span>
                        Configurer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1Charger;
