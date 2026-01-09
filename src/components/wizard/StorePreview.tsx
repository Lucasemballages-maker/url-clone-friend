import { ShoppingCart, User, Star, Check } from "lucide-react";
import { StoreData } from "@/types/store";
import { useState } from "react";

interface StorePreviewProps {
  storeData: StoreData;
}

export const StorePreview = ({ storeData }: StorePreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = storeData.productImages.length > 0 ? storeData.productImages : ["/placeholder.svg"];
  const mainImage = images[currentImageIndex] || "/placeholder.svg";

  const discount = storeData.originalPrice && storeData.productPrice 
    ? Math.round(((parseFloat(storeData.originalPrice) - parseFloat(storeData.productPrice)) / parseFloat(storeData.originalPrice)) * 100)
    : 0;

  // Generate a light blue color from primary or use default
  const accentColor = storeData.primaryColor || "#3B82F6";

  return (
    <div className="relative mx-auto" style={{ maxWidth: "340px" }}>
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
          {/* Announcement Bar - Blue gradient like clair-eau */}
          <div 
            className="text-center py-2 px-4 text-[10px] text-white font-medium"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            }}
          >
            {storeData.announcementBar || "Livraison OFFERTE | Noté 4.8/5 d'après + de 20 000 clients"}
          </div>

          {/* Navbar - Clean white with logo centered */}
          <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-800 underline underline-offset-4">ACCUEIL</span>
              <span className="text-xs font-medium text-gray-500 uppercase">{storeData.storeName || "BOUTIQUE"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'serif' }}>
                {storeData.storeName || "Boutique"}
              </span>
              <span className="text-xs" style={{ color: accentColor }}>™</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-600" />
              <ShoppingCart className="w-4 h-4 text-gray-600" />
            </div>
          </nav>

          {/* Hero Section - Split layout like clair-eau */}
          <div className="flex min-h-[320px]">
            {/* Left Content */}
            <div className="flex-1 flex flex-col justify-center px-4 py-6 bg-gray-50">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
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
                <span className="text-[10px] ml-1" style={{ color: accentColor }}>
                  Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-xl font-bold text-gray-900 leading-tight mb-4" style={{ fontFamily: 'serif' }}>
                {storeData.headline || storeData.productName}
              </h1>

              {/* Benefits Pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(storeData.benefits?.slice(0, 3) || ["Filtre chlore et métaux lourds", "Installation en 2 minutes", "Garantie 1 an incluse"]).map((benefit, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-full border font-medium"
                    style={{ 
                      borderColor: `${accentColor}40`,
                      color: accentColor,
                      backgroundColor: `${accentColor}08`
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                    {benefit}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                className="w-full py-3 rounded-full text-white font-bold text-xs uppercase tracking-wide transition-all hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>

              {/* Sub-benefits */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[9px]">
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center">
                    <Check className="w-2 h-2" />
                  </span>
                  Essayez sans risque
                </span>
                <span className="flex items-center gap-1" style={{ color: accentColor }}>
                  <Check className="w-3 h-3" />
                  Livraison OFFERTE
                </span>
              </div>
            </div>

            {/* Right Image - Full bleed product photo */}
            <div className="w-[45%] relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
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

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 justify-center bg-white border-t border-gray-100">
              {images.slice(0, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Price Section */}
          <div className="px-4 py-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-bold text-gray-900">
                {storeData.productPrice}€
              </span>
              {storeData.originalPrice && storeData.originalPrice !== storeData.productPrice && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {storeData.originalPrice}€
                  </span>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: '#22C55E' }}
                  >
                    Économisez {(parseFloat(storeData.originalPrice) - parseFloat(storeData.productPrice)).toFixed(0)}€
                  </span>
                </>
              )}
            </div>
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

export default StorePreview;
