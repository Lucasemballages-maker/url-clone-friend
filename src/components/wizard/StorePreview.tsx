import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <div className="relative mx-auto" style={{ maxWidth: "320px" }}>
      {/* Phone Frame */}
      <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
        
        {/* Phone Screen */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Announcement Bar */}
          <div 
            className="text-center py-2 px-4 text-xs text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: storeData.primaryColor }}
          >
            <ChevronLeft className="w-3 h-3 opacity-70" />
            <span className="truncate">{storeData.announcementBar}</span>
            <ChevronRight className="w-3 h-3 opacity-70" />
          </div>

          {/* Navbar */}
          <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="w-6" />
            <span className="text-base font-medium tracking-wide text-gray-800 lowercase">
              {storeData.storeName || "boutique"}
            </span>
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </nav>

          {/* Product Hero */}
          <div className="relative">
            {/* Product Title Overlay */}
            <div className="absolute top-4 left-4 z-10 max-w-[50%]">
              <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1">
                {storeData.headline || storeData.productName}
              </h2>
              <p className="text-xs text-gray-600 line-clamp-3">
                {storeData.description?.slice(0, 80)}...
              </p>
            </div>

            {/* Main Image with Navigation */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
              <img
                src={mainImage}
                alt={storeData.productName}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 justify-center">
              {images.slice(0, 5).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-gray-900 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
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

          {/* Price & CTA */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">
                  {storeData.productPrice}€
                </span>
                {storeData.originalPrice && storeData.originalPrice !== storeData.productPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {storeData.originalPrice}€
                  </span>
                )}
              </div>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${storeData.primaryColor}20`,
                  color: storeData.primaryColor 
                }}
              >
                -{Math.round(((parseFloat(storeData.originalPrice) - parseFloat(storeData.productPrice)) / parseFloat(storeData.originalPrice)) * 100)}%
              </span>
            </div>
            <button 
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-transform active:scale-95"
              style={{ backgroundColor: storeData.primaryColor }}
            >
              {storeData.cta || "Acheter maintenant"}
            </button>
          </div>

          {/* Benefits Pills */}
          {storeData.benefits && storeData.benefits.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {storeData.benefits.slice(0, 3).map((benefit, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bottom safe area */}
          <div className="h-6 bg-white" />
        </div>
      </div>

      {/* Phone Home Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-700 rounded-full" />
    </div>
  );
};

export default StorePreview;
