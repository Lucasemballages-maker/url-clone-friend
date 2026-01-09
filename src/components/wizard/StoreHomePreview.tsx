import { ShoppingCart, User, Star, Check, ChevronRight } from "lucide-react";
import { StoreData } from "@/types/store";

interface StoreHomePreviewProps {
  storeData: StoreData;
}

export const StoreHomePreview = ({ storeData }: StoreHomePreviewProps) => {
  const mainImage = storeData.productImages[0] || "/placeholder.svg";
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
          {/* Announcement Bar */}
          <div 
            className="text-center py-2 px-4 text-[10px] text-white font-medium"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            }}
          >
            {storeData.announcementBar || "Livraison OFFERTE | Noté 4.8/5 d'après + de 20 000 clients"}
          </div>

          {/* Navbar */}
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

          {/* Hero Section */}
          <div className="relative">
            {/* Background Image */}
            <div className="h-56 relative overflow-hidden">
              <img
                src={mainImage}
                alt={storeData.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute inset-0 flex flex-col justify-center px-4">
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
                  <span className="text-[9px] ml-1" style={{ color: accentColor }}>
                    Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+)
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-lg font-bold text-gray-900 leading-tight mb-3 max-w-[70%]" style={{ fontFamily: 'serif' }}>
                  {storeData.headline || storeData.productName}
                </h1>

                {/* CTA */}
                <button 
                  className="self-start px-6 py-2.5 rounded-full text-white font-bold text-[10px] uppercase tracking-wide"
                  style={{ backgroundColor: accentColor }}
                >
                  Découvrir
                </button>
              </div>
            </div>
          </div>

          {/* Section Title */}
          <div className="px-4 py-4 bg-gray-50">
            <h2 className="text-center text-base font-bold text-gray-900 mb-1" style={{ fontFamily: 'serif' }}>
              Votre peau mérite une eau pure
            </h2>
            <p className="text-center text-[10px] text-gray-500">
              Découvrez notre solution de filtration
            </p>
          </div>

          {/* Product Card */}
          <div className="px-4 py-3 bg-white">
            <div className="bg-gray-50 rounded-2xl p-3 flex gap-3">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-900 mb-1 line-clamp-1">
                  {storeData.productName}
                </h3>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[9px] text-gray-500 ml-1">({storeData.reviews || "21 883"})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{storeData.productPrice}€</span>
                  {storeData.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">{storeData.originalPrice}€</span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 self-center" />
            </div>
          </div>

          {/* Benefits Section */}
          <div className="px-4 py-3 bg-white border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2">
              {(storeData.benefits?.slice(0, 3) || ["Filtre efficace", "Installation facile", "Garantie 1 an"]).map((benefit, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}15` }}
                  >
                    <Check className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  <span className="text-[9px] text-gray-600 leading-tight block">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Bar */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-[9px] text-gray-600">Livraison gratuite</span>
              </div>
              <div className="w-px h-3 bg-gray-300" />
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3" style={{ color: accentColor }} />
                <span className="text-[9px] text-gray-600">Satisfait ou remboursé</span>
              </div>
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

export default StoreHomePreview;
