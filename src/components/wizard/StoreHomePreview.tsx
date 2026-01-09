import { ShoppingCart, ChevronLeft, ChevronRight, Star, Check } from "lucide-react";
import { StoreData } from "@/types/store";

interface StoreHomePreviewProps {
  storeData: StoreData;
}

export const StoreHomePreview = ({ storeData }: StoreHomePreviewProps) => {
  const mainImage = storeData.productImages[0] || "/placeholder.svg";
  
  // Teal color like clair-eau
  const tealColor = "#0D9488";

  return (
    <div className="relative mx-auto" style={{ maxWidth: "320px" }}>
      {/* Phone Frame */}
      <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] p-2 shadow-2xl ring-1 ring-white/10">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-16 h-4 bg-zinc-900 rounded-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
            <div className="w-8 h-1.5 rounded-full bg-zinc-700" />
          </div>
        </div>
        
        {/* Phone Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Announcement Bar */}
          <div 
            className="text-center py-3 px-6 text-[10px] text-white font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: tealColor }}
          >
            <ChevronLeft className="w-3 h-3 opacity-70" />
            <span className="flex-1 leading-tight">
              {storeData.announcementBar || "Livraison gratuite sur les commandes supérieures à 50 € | Livraison rapide dans le monde entier"}
            </span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </div>

          {/* Navbar */}
          <nav className="flex items-center justify-center px-5 py-4 bg-white relative">
            <span className="text-xl font-light tracking-wide text-zinc-700 lowercase" style={{ fontFamily: 'serif' }}>
              {storeData.storeName || "douche"}
            </span>
            <div className="absolute right-5">
              <ShoppingCart className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
            </div>
          </nav>

          {/* Hero Section - Like clair-eau homepage */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 min-h-[220px]">
            {/* Left Content */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 max-w-[55%]">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-3 h-3" 
                    style={{ 
                      fill: i < 4 ? '#FBBF24' : 'transparent',
                      color: '#FBBF24'
                    }} 
                  />
                ))}
                <span className="text-[9px] text-teal-600 ml-1">
                  Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-lg font-bold text-zinc-900 leading-tight mb-3" style={{ fontFamily: 'serif' }}>
                {storeData.headline || "Douche Purifiée Quotidienne"}
              </h1>

              {/* Benefits */}
              <div className="space-y-1.5 mb-4">
                {(storeData.benefits?.slice(0, 3) || ["Filtre chlore et métaux lourds", "Installation en 2 minutes", "Garantie 1 an incluse"]).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tealColor }}
                    />
                    <span className="text-[9px] text-zinc-600">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                className="px-5 py-2.5 rounded-md text-white font-bold text-[10px] uppercase tracking-wide"
                style={{ backgroundColor: tealColor }}
              >
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>

              {/* Sub-benefits */}
              <div className="flex items-center gap-3 mt-2.5">
                <span className="flex items-center gap-1 text-[8px] text-zinc-500">
                  <span className="w-2.5 h-2.5 rounded-full border border-zinc-300 flex items-center justify-center">
                    <Check className="w-1.5 h-1.5" />
                  </span>
                  Essayez sans risque
                </span>
                <span className="flex items-center gap-1 text-[8px]" style={{ color: tealColor }}>
                  <Check className="w-2.5 h-2.5" />
                  Livraison OFFERTE
                </span>
              </div>
            </div>

            {/* Right Image */}
            <div className="absolute right-0 top-0 bottom-0 w-[45%]">
              <img
                src={mainImage}
                alt={storeData.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>

          {/* Brand marquee */}
          <div className="py-3 bg-white border-y border-zinc-100">
            <div className="flex items-center justify-center gap-6">
              {[1, 2, 3].map((i) => (
                <span key={i} className="text-sm font-light text-zinc-400 italic" style={{ fontFamily: 'serif' }}>
                  {storeData.storeName || "Boutique"}
                </span>
              ))}
            </div>
          </div>

          {/* Section title */}
          <div className="px-4 py-4 bg-white text-center">
            <h2 className="text-base font-bold text-zinc-900 mb-1" style={{ fontFamily: 'serif' }}>
              Votre peau mérite une eau pure
            </h2>
            <p className="text-[10px] text-zinc-500">
              Découvrez notre solution de filtration premium
            </p>
          </div>

          {/* Bottom safe area */}
          <div className="h-6 bg-white" />
        </div>
      </div>

      {/* Phone Home Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
};

export default StoreHomePreview;
