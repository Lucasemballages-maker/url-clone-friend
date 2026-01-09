import { ShoppingCart, ChevronLeft, ChevronRight, Star, Truck, Shield, RotateCcw } from "lucide-react";
import { StoreData } from "@/types/store";
import { useState } from "react";

interface StorePreviewProps {
  storeData: StoreData;
}

export const StorePreview = ({ storeData }: StorePreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = storeData.productImages.length > 0 ? storeData.productImages : ["/placeholder.svg"];
  const mainImage = images[currentImageIndex] || "/placeholder.svg";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const discount = storeData.originalPrice && storeData.productPrice 
    ? Math.round(((parseFloat(storeData.originalPrice) - parseFloat(storeData.productPrice)) / parseFloat(storeData.originalPrice)) * 100)
    : 0;

  return (
    <div className="relative mx-auto" style={{ maxWidth: "340px" }}>
      {/* Phone Frame - Premium Design */}
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
          {/* Announcement Bar - Premium Gradient */}
          <div 
            className="text-center py-2.5 px-4 text-xs text-white flex items-center justify-center gap-3 font-medium tracking-wide"
            style={{ 
              background: `linear-gradient(135deg, ${storeData.primaryColor}, ${storeData.primaryColor}dd)`,
            }}
          >
            <ChevronLeft className="w-3 h-3 opacity-60" />
            <span className="truncate">{storeData.announcementBar}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </div>

          {/* Navbar - Refined */}
          <nav className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div className="w-6" />
            <span className="text-lg font-semibold tracking-wider text-zinc-900 lowercase font-serif">
              {storeData.storeName || "boutique"}
            </span>
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-zinc-700" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-900 text-white text-[10px] rounded-full flex items-center justify-center font-medium">0</span>
            </div>
          </nav>

          {/* Product Image Section */}
          <div className="relative bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
            <div className="relative aspect-square">
              <img
                src={mainImage}
                alt={storeData.productName}
                className="w-full h-full object-contain p-6"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              
              {/* Navigation Arrows - Elegant */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-800" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-800" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image Thumbnails - Premium Style */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 justify-center bg-white">
              {images.slice(0, 5).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-zinc-900 ring-offset-2 shadow-lg scale-105' 
                      : 'opacity-50 hover:opacity-80 hover:scale-102'
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

          {/* Product Info Section */}
          <div className="px-5 py-4 space-y-4 bg-white">
            {/* Product Title */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 leading-tight mb-1 font-serif">
                {storeData.headline || storeData.productName}
              </h2>
              <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                {storeData.description?.slice(0, 100)}...
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-zinc-600 font-medium">{storeData.rating || "4.9"}</span>
              <span className="text-sm text-zinc-400">({storeData.reviews || "128"} avis)</span>
            </div>

            {/* Price Section */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-zinc-900">
                {storeData.productPrice}€
              </span>
              {storeData.originalPrice && storeData.originalPrice !== storeData.productPrice && (
                <>
                  <span className="text-lg text-zinc-400 line-through">
                    {storeData.originalPrice}€
                  </span>
                  <span 
                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: storeData.primaryColor }}
                  >
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* CTA Button - Premium */}
            <button 
              className="w-full py-4 rounded-2xl text-white font-bold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg"
              style={{ 
                backgroundColor: storeData.primaryColor,
                boxShadow: `0 10px 25px -5px ${storeData.primaryColor}50`
              }}
            >
              {storeData.cta || "Acheter maintenant"}
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 py-3 border-t border-zinc-100">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Truck className="w-4 h-4" />
                <span className="text-[11px] font-medium">Livraison gratuite</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Shield className="w-4 h-4" />
                <span className="text-[11px] font-medium">Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-500">
                <RotateCcw className="w-4 h-4" />
                <span className="text-[11px] font-medium">Retours 30j</span>
              </div>
            </div>
          </div>

          {/* Benefits Pills */}
          {storeData.benefits && storeData.benefits.length > 0 && (
            <div className="px-5 pb-4 bg-white">
              <div className="flex flex-wrap gap-2">
                {storeData.benefits.slice(0, 3).map((benefit, index) => (
                  <span 
                    key={index}
                    className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 font-medium"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom safe area */}
          <div className="h-8 bg-white" />
        </div>
      </div>

      {/* Phone Home Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
};

export default StorePreview;
