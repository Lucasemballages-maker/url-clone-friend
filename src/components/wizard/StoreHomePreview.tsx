import { ShoppingCart, ChevronLeft, ChevronRight, Star, ArrowRight, Menu } from "lucide-react";
import { StoreData } from "@/types/store";

interface StoreHomePreviewProps {
  storeData: StoreData;
}

export const StoreHomePreview = ({ storeData }: StoreHomePreviewProps) => {
  const mainImage = storeData.productImages[0] || "/placeholder.svg";

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
          {/* Announcement Bar */}
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

          {/* Navbar */}
          <nav className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <Menu className="w-5 h-5 text-zinc-700" />
            <span className="text-lg font-semibold tracking-wider text-zinc-900 lowercase font-serif">
              {storeData.storeName || "boutique"}
            </span>
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-zinc-700" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-900 text-white text-[10px] rounded-full flex items-center justify-center font-medium">0</span>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="relative h-48 overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${storeData.primaryColor}15 0%, ${storeData.primaryColor}05 100%)`
              }}
            />
            <div className="absolute inset-0 flex items-center px-5">
              <div className="flex-1 pr-4 z-10">
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest mb-2 block"
                  style={{ color: storeData.primaryColor }}
                >
                  Nouveau
                </span>
                <h1 className="text-xl font-bold text-zinc-900 leading-tight mb-2 font-serif">
                  {storeData.headline || storeData.productName}
                </h1>
                <button 
                  className="flex items-center gap-1.5 text-xs font-semibold mt-2"
                  style={{ color: storeData.primaryColor }}
                >
                  Découvrir <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="w-32 h-32 relative">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="px-5 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Tous', 'Nouveautés', 'Best-sellers', 'Promo'].map((cat, i) => (
                <span 
                  key={cat}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    i === 0 
                      ? 'text-white' 
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                  style={i === 0 ? { backgroundColor: storeData.primaryColor } : {}}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Featured Product Card */}
          <div className="px-5 pb-4">
            <div className="bg-zinc-50 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span 
                  className="text-[10px] font-bold px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: storeData.primaryColor }}
                >
                  -30%
                </span>
              </div>
              <div className="flex gap-4">
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
                  <h3 className="text-sm font-bold text-zinc-900 mb-1 line-clamp-1">
                    {storeData.productName}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-[10px] text-zinc-500 ml-1">({storeData.reviews || "128"})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-zinc-900">{storeData.productPrice}€</span>
                    <span className="text-xs text-zinc-400 line-through">{storeData.originalPrice}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="px-5 pb-4">
            <h2 className="text-base font-bold text-zinc-900 mb-3 font-serif">Nos produits</h2>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="bg-zinc-50 rounded-xl p-3">
                  <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center">
                    <img
                      src={storeData.productImages[i] || mainImage}
                      alt="Product"
                      className="w-4/5 h-4/5 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <h4 className="text-xs font-medium text-zinc-900 mb-1 line-clamp-1">
                    {storeData.productName}
                  </h4>
                  <span className="text-sm font-bold text-zinc-900">{storeData.productPrice}€</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom safe area */}
          <div className="h-8 bg-white" />
        </div>
      </div>

      {/* Phone Home Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
};

export default StoreHomePreview;
