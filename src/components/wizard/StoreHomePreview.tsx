import { ShoppingCart, Star, Check, ChevronRight, Clock } from "lucide-react";
import { StoreData } from "@/types/store";
import { useState, useEffect } from "react";

interface StoreHomePreviewProps {
  storeData: StoreData;
}

export const StoreHomePreview = ({ storeData }: StoreHomePreviewProps) => {
  const mainImage = storeData.productImages[0] || "/placeholder.svg";
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 47, seconds: 33 });
  
  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 47, seconds: 33 }; // Reset
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Use storeData colors with fallbacks
  const primaryColor = storeData.primaryColor || "#4A90E2";
  const accentColor = storeData.accentColor || "#764ba2";
  const gradientBg = `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`;

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* Browser Frame */}
      <div className="relative bg-zinc-800 rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
        {/* Browser Top Bar */}
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-zinc-700 rounded-md px-3 py-1 mx-2">
            <span className="text-[10px] text-zinc-400 truncate">
              {storeData.storeName ? `${storeData.storeName.toLowerCase().replace(/\s+/g, '-')}.myshopify.com` : 'votre-boutique.myshopify.com'}
            </span>
          </div>
        </div>
        
        {/* Site Content */}
        <div className="bg-white overflow-hidden">
          {/* Scrollable Content */}
          <div className="h-[520px] overflow-y-auto scrollbar-hide">
            
            {/* Promo Banner with Countdown */}
            <div className="bg-red-600 py-2 px-3">
              <div className="flex items-center justify-center gap-2 text-white">
                <Clock className="w-3 h-3 animate-pulse" />
                <span className="text-[9px] font-bold">🔥 OFFRE FLASH -29%</span>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                  <span className="text-[10px] font-mono font-bold">
                    {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Marquee Banner */}
            <div 
              className="py-1.5 overflow-hidden whitespace-nowrap"
              style={{ background: gradientBg }}
            >
              <div className="animate-marquee inline-flex gap-8">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="text-white text-[10px] font-semibold uppercase tracking-widest">
                    ✦ {storeData.storeName || "Votre Marque"}
                  </span>
                ))}
              </div>
            </div>

            {/* Header */}
            <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: primaryColor }}>
                  {storeData.storeName || "Votre Marque"}
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    className="text-white text-[9px] font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Commander
                  </button>
                  <ShoppingCart className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section 
              className="text-white px-4 py-8 text-center"
              style={{ background: gradientBg }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-[9px] mb-3">
                <span>⭐ Noté {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ clients satisfaits)</span>
              </div>
              
              <h1 className="text-xl font-bold mb-3 leading-tight">
                {storeData.headline || storeData.productName || "Douche Purifiée Quotidienne"}
              </h1>
              
              {/* Features */}
              <div className="flex flex-col gap-2 text-[10px] my-4">
                {(storeData.benefits?.slice(0, 3) || [
                  "Filtre chlore et métaux lourds",
                  "Installation en 2 minutes",
                  "Garantie 1 an incluse"
                ]).map((benefit, i) => (
                  <div key={i} className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <button className="bg-white text-[11px] font-bold px-8 py-3 rounded-full shadow-lg mt-3" style={{ color: primaryColor }}>
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>
              
              {/* Trust badges */}
              <div className="flex justify-center gap-4 mt-4 text-[9px] opacity-90">
                <span>✓ Essai sans risque</span>
                <span>✓ Livraison OFFERTE</span>
              </div>
            </section>

            {/* Featured Product */}
            <section className="px-4 py-6 bg-white">
              <div className="text-center mb-4">
                <h2 className="text-base font-bold text-zinc-800">Notre Best-Seller</h2>
                <p className="text-[9px] text-zinc-500">Le produit préféré de nos clients</p>
              </div>
              
              {/* Product Card */}
              <div className="bg-gray-50 rounded-2xl p-4 shadow-sm">
                <div className="relative">
                  <img
                    src={mainImage}
                    alt={storeData.productName}
                    className="w-full aspect-square object-cover rounded-xl mb-3"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  {storeData.originalPrice && storeData.productPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded-full">
                      PROMO
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[8px] text-zinc-500">({storeData.reviews || "21 883"} avis)</span>
                </div>
                
                <h3 className="text-sm font-bold text-zinc-800 mb-1">
                  {storeData.productName || "Filtre de Douche Premium"}
                </h3>
                
                <p className="text-[9px] text-zinc-500 mb-2 line-clamp-2">
                  {storeData.description?.slice(0, 80) || "Transformez votre douche en spa avec notre filtre de qualité premium."}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {storeData.originalPrice && (
                      <span className="text-zinc-400 line-through text-xs">
                        {storeData.originalPrice.includes('€') ? storeData.originalPrice : `${storeData.originalPrice}€`}
                      </span>
                    )}
                    <span className="text-lg font-bold" style={{ color: primaryColor }}>
                      {storeData.productPrice ? (storeData.productPrice.includes('€') ? storeData.productPrice : `${storeData.productPrice}€`) : "49,90€"}
                    </span>
                  </div>
                  <button 
                    className="text-white text-[9px] font-bold px-4 py-2 rounded-full flex items-center gap-1"
                    style={{ background: gradientBg }}
                  >
                    Voir <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-gray-50 px-4 py-6">
              <h2 className="text-center text-sm font-bold text-zinc-800 mb-4">
                Pourquoi nous choisir ?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {(storeData.benefitCards || [
                  { icon: "💧", title: "Eau Purifiée", desc: "Filtre 99% du chlore et des impuretés" },
                  { icon: "✨", title: "Peau Éclatante", desc: "Peau plus douce et éclatante" },
                  { icon: "🚿", title: "Installation Simple", desc: "Se fixe en 2 minutes" },
                  { icon: "🛡️", title: "Garantie 1 An", desc: "Protection complète" },
                ]).map((item, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="text-[10px] font-bold text-zinc-800 mb-1">{item.title}</h3>
                    <p className="text-[8px] text-zinc-500 leading-tight">{'description' in item ? item.description : item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Social Proof */}
            <section className="px-4 py-6 bg-white">
              <h2 className="text-center text-sm font-bold text-zinc-800 mb-4">
                Ce que disent nos clients
              </h2>
              <div className="space-y-3">
                {(storeData.homeReviews || storeData.customerReviews || [
                  { initials: "LM", name: "Lucas M.", text: "Service client réactif et livraison rapide !", rating: 5 },
                  { initials: "ER", name: "Emma R.", text: "Boutique sérieuse, je recommande vivement.", rating: 5 },
                  { initials: "TB", name: "Thomas B.", text: "Très bonne expérience d'achat.", rating: 4 },
                ]).map((review, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                      style={{ background: gradientBg }}
                    >
                      {review.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-zinc-800">{review.name}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating || 5)].map((_, j) => (
                            <Star key={j} className="w-2 h-2 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-500">"{review.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section 
              className="text-white px-4 py-8 text-center"
              style={{ background: gradientBg }}
            >
              <h2 className="text-lg font-bold mb-2">Prêt à transformer votre douche ?</h2>
              <p className="text-[10px] opacity-90 mb-4">Rejoignez plus de {storeData.reviews || "21 000"} clients satisfaits</p>
              <button className="bg-white text-[11px] font-bold px-8 py-3 rounded-full shadow-lg" style={{ color: primaryColor }}>
                {storeData.cta || "COMMANDER MAINTENANT"}
              </button>
              <div className="flex justify-center gap-4 mt-3 text-[8px] opacity-80">
                <span>✓ Paiement sécurisé</span>
                <span>✓ Livraison gratuite</span>
                <span>✓ Garantie 30 jours</span>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-800 text-white px-4 py-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-[10px] font-bold mb-2">Navigation</h4>
                  <ul className="space-y-1 text-[8px] text-zinc-400">
                    <li>Accueil</li>
                    <li>Produits</li>
                    <li>À propos</li>
                    <li>Contact</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold mb-2">Support</h4>
                  <ul className="space-y-1 text-[8px] text-zinc-400">
                    <li>FAQ</li>
                    <li>Livraison</li>
                    <li>Retours</li>
                    <li>CGV</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-zinc-700 pt-3 text-center">
                <p className="text-[8px] text-zinc-500">© 2025 {storeData.storeName || "Votre Marque"}. Tous droits réservés.</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHomePreview;
