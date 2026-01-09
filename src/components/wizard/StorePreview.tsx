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

  // Teal color like clair-eau/copyfy
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
          {/* Announcement Bar - Teal like Copyfy */}
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

          {/* Navbar - Clean minimal */}
          <nav className="flex items-center justify-center px-5 py-4 bg-white relative">
            <span className="text-xl font-light tracking-wide text-zinc-700 lowercase" style={{ fontFamily: 'serif' }}>
              {storeData.storeName || "douche"}
            </span>
            <div className="absolute right-5">
              <ShoppingCart className="w-5 h-5 text-zinc-700" strokeWidth={1.5} />
            </div>
          </nav>

          {/* Main Product Image Area */}
          <div className="relative bg-[#f8f8f8] border border-zinc-100 mx-3 rounded-lg overflow-hidden">
            {/* Product Info Overlay */}
            <div className="absolute top-4 left-4 z-10 max-w-[45%]">
              <h2 className="text-base font-bold text-zinc-900 leading-tight mb-2" style={{ fontFamily: 'serif' }}>
                {storeData.headline || storeData.productName}
              </h2>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                {storeData.description?.slice(0, 100) || "Highly efficient in removing residual chlorine, heavy metals and other harmful substances"}
              </p>
            </div>

            {/* Main Image */}
            <div className="aspect-[4/5] relative flex items-center justify-center p-4">
              <img
                src={mainImage}
                alt={storeData.productName}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              
              {/* Navigation Arrow - Right side */}
              {images.length > 1 && (
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-2 px-3 py-3 overflow-x-auto">
            {images.slice(0, 5).map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-zinc-400 shadow-md' 
                    : 'border-zinc-200 opacity-70 hover:opacity-100'
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
