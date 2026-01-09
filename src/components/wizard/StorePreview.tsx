import { ShoppingCart, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Use storeData colors with fallbacks
  const primaryColor = storeData.primaryColor || "#4A90E2";
  const accentColor = storeData.accentColor || "#764ba2";
  const gradientBg = `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`;

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
          {/* Scrollable Content */}
          <div className="h-[580px] overflow-y-auto scrollbar-hide">
            
            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  {storeData.storeName || "Votre Marque"}
                </span>
                <button 
                  className="text-white text-[9px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  Commander
                </button>
              </div>
            </header>

            {/* Hero Section */}
            <section 
              className="text-white px-4 py-6 text-center"
              style={{ background: gradientBg }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-[8px] mb-2">
                <span>⭐ {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ clients)</span>
              </div>
              
              <h1 className="text-lg font-bold mb-2 leading-tight">
                {storeData.headline || storeData.productName || "Douche Purifiée Quotidienne"}
              </h1>
              
              {/* Features */}
              <div className="flex flex-col gap-1 text-[9px] my-3">
                {(storeData.benefits?.slice(0, 3) || [
                  "Filtre chlore et métaux lourds",
                  "Installation en 2 minutes",
                  "Garantie 1 an incluse"
                ]).map((benefit, i) => (
                  <div key={i} className="flex items-center justify-center gap-1">
                    <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <button className="bg-white text-[10px] font-bold px-6 py-2 rounded-full shadow-lg mt-2" style={{ color: primaryColor }}>
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>
              
              {/* Trust badges */}
              <div className="flex justify-center gap-3 mt-3 text-[8px] opacity-90">
                <span>✓ Essai sans risque</span>
                <span>✓ Livraison OFFERTE</span>
              </div>
            </section>

            {/* Product Section */}
            <section className="px-4 py-5">
              {/* Product Gallery */}
              <div className="relative mb-4">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full aspect-square object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow"
                    >
                      <ChevronLeft className="w-3 h-3 text-zinc-600" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow"
                    >
                      <ChevronRight className="w-3 h-3 text-zinc-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-400 shadow-md' 
                        : 'border-zinc-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Product Info */}
              <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-[8px] mb-2">
                <span>⭐ {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ clients)</span>
              </div>
              
              <h2 className="text-base font-bold text-zinc-800 mb-1">
                {storeData.productName || "Nom du Produit"}
              </h2>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[9px] text-zinc-500">({storeData.reviews || "21 883"} avis)</span>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                {storeData.originalPrice && (
                  <span className="text-zinc-400 line-through text-sm">
                    {storeData.originalPrice.includes('€') ? storeData.originalPrice : `${storeData.originalPrice}€`}
                  </span>
                )}
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  {storeData.productPrice ? (storeData.productPrice.includes('€') ? storeData.productPrice : `${storeData.productPrice}€`) : "49,90€"}
                </span>
                {storeData.originalPrice && storeData.productPrice && (
                  <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full">PROMO</span>
                )}
              </div>
              
              {/* Benefits List */}
              <ul className="space-y-2 mb-4">
                {(storeData.benefits?.slice(0, 4) || [
                  "Filtration supérieure qui élimine 99% du chlore",
                  "Installation universelle en 2 minutes chrono",
                  "Résultats visibles dès la première douche",
                  "Garantie satisfait ou remboursé 30 jours"
                ]).map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-zinc-600">
                    <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <button 
                className="w-full text-white text-[11px] font-bold py-3 rounded-full shadow-lg"
                style={{ background: gradientBg }}
              >
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>
              
              <div className="flex justify-center gap-3 mt-2 text-[8px] text-zinc-500">
                <span>✓ Paiement sécurisé</span>
                <span>✓ Livraison gratuite</span>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-gray-50 px-4 py-5">
              <h2 className="text-center text-sm font-bold text-zinc-800 mb-4">
                Votre peau mérite une eau pure
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "💧", title: "Eau Purifiée", desc: "Filtre 99% du chlore" },
                  { icon: "✨", title: "Peau Éclatante", desc: "Peau plus douce" },
                  { icon: "🚿", title: "Installation Simple", desc: "En 2 minutes" },
                  { icon: "🛡️", title: "Garantie 1 An", desc: "Protection complète" },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <div className="text-xl mb-1">{item.icon}</div>
                    <h3 className="text-[10px] font-bold text-zinc-800">{item.title}</h3>
                    <p className="text-[8px] text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="px-4 py-5">
              <h2 className="text-center text-sm font-bold text-zinc-800 mb-4">
                Ce que disent nos clients
              </h2>
              <div className="space-y-2">
                {[
                  { initials: "MC", name: "Marie C.", text: "Résultats visibles dès la première semaine. Ma peau n'a jamais été aussi douce !" },
                  { initials: "JD", name: "Jean D.", text: "Installation super simple. Je recommande à 100% ce produit." },
                ].map((review, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: gradientBg }}
                      >
                        {review.initials}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-zinc-800">{review.name}</div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="w-2 h-2 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 italic">"{review.text}"</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section 
              className="text-white px-4 py-6 text-center"
              style={{ background: gradientBg }}
            >
              <h2 className="text-base font-bold mb-2">Prêt à transformer votre douche ?</h2>
              <p className="text-[9px] opacity-90 mb-3">Profitez de -29% aujourd'hui seulement</p>
              <button className="bg-white text-[10px] font-bold px-6 py-2 rounded-full shadow-lg" style={{ color: primaryColor }}>
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-800 text-white px-4 py-4 text-center">
              <p className="text-[8px] opacity-70">© 2025 {storeData.storeName || "Votre Marque"}. Tous droits réservés.</p>
            </footer>
          </div>
        </div>
      </div>

      {/* Phone Home Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-zinc-600 rounded-full" />
    </div>
  );
};

export default StorePreview;
