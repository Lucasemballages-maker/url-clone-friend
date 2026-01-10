import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Check, Star, ChevronLeft, ChevronRight, Clock, Shield, Truck, RefreshCw, Loader2 } from "lucide-react";
import { StoreData } from "@/types/store";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

interface DeployedStore {
  id: string;
  subdomain: string;
  store_data: StoreData;
  status: string;
  payment_url: string | null;
  stripe_api_key: string | null;
}

const PublicStore = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const [store, setStore] = useState<DeployedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 47, seconds: 33 });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (!subdomain) {
        setError("Boutique non trouvée");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("deployed_stores")
          .select("*")
          .eq("subdomain", subdomain)
          .eq("status", "active")
          .maybeSingle();

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          setError("Erreur lors du chargement");
        } else if (!data) {
          setError("Boutique non trouvée");
        } else {
          // Type assertion for store_data
          const storeData = data.store_data as unknown as StoreData;
          setStore({
            ...data,
            store_data: storeData,
            payment_url: data.payment_url,
            stripe_api_key: data.stripe_api_key ? "configured" : null, // Don't expose actual key
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [subdomain]);

  // Countdown timer
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
        return { hours: 2, minutes: 47, seconds: 33 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">404</h1>
          <p className="text-gray-600">{error || "Boutique non trouvée"}</p>
        </div>
      </div>
    );
  }

  const storeData = store.store_data;
  const images = storeData.productImages?.length > 0 ? storeData.productImages : ["/placeholder.svg"];
  const mainImage = images[currentImageIndex] || "/placeholder.svg";
  const primaryColor = storeData.primaryColor || "#4A90E2";
  const accentColor = storeData.accentColor || "#764ba2";
  const gradientBg = `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleOrder = async () => {
    if (!store) return;

    // If store has Stripe API key configured, use dynamic checkout
    if (store.stripe_api_key) {
      setProcessingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-store-checkout', {
          body: { store_id: store.id }
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        } else if (data?.redirect_url) {
          window.open(data.redirect_url, '_blank');
        } else {
          throw new Error("No checkout URL received");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        toast.error("Erreur lors du paiement. Veuillez réessayer.");
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    // Fallback to payment URL
    if (store.payment_url) {
      window.open(store.payment_url, '_blank');
    } else {
      toast.error("Cette boutique n'a pas encore configuré les paiements");
    }
  };

  return (
    <>
      <Helmet>
        <title>{storeData.productName || "Boutique"} | {storeData.storeName || "Dropyfy"}</title>
        <meta name="description" content={storeData.description || storeData.headline || "Découvrez notre produit exclusif"} />
        <meta property="og:title" content={storeData.productName || "Boutique"} />
        <meta property="og:description" content={storeData.description || storeData.headline || "Découvrez notre produit exclusif"} />
        <meta property="og:image" content={images[0]} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Promo Banner with Countdown */}
        <div className="bg-red-600 py-3 px-4">
          <div className="flex items-center justify-center gap-3 text-white max-w-4xl mx-auto">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-bold">🔥 OFFRE FLASH -29%</span>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded">
              <span className="text-sm font-mono font-bold">
                {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Marquee Banner */}
        <div 
          className="py-2 overflow-hidden whitespace-nowrap"
          style={{ background: gradientBg }}
        >
          <div className="animate-marquee inline-flex gap-12">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="text-white text-sm font-semibold uppercase tracking-widest">
                ✦ {storeData.storeName || "Votre Marque"}
              </span>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span className="text-xl font-bold" style={{ color: primaryColor }}>
              {storeData.storeName || "Votre Marque"}
            </span>
            <button 
              onClick={handleOrder}
              className="text-white text-sm font-semibold px-6 py-2 rounded-full transition-transform hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              Commander
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section 
          className="text-white px-6 py-12 md:py-20 text-center"
          style={{ background: gradientBg }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm mb-4">
              <span>⭐ {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ clients satisfaits)</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {storeData.headline || storeData.productName || "Découvrez notre produit"}
            </h1>
            
            <div className="flex flex-col gap-2 text-sm md:text-base my-6 max-w-md mx-auto">
              {(storeData.benefits?.slice(0, 3) || [
                "Qualité premium garantie",
                "Installation en 2 minutes",
                "Garantie 1 an incluse"
              ]).map((benefit, i) => (
                <div key={i} className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleOrder}
              className="bg-white text-base font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 mt-4"
              style={{ color: primaryColor }}
            >
              {storeData.cta || "ACHETER MAINTENANT"}
            </button>
            
            <div className="flex justify-center gap-6 mt-6 text-sm opacity-90">
              <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Livraison OFFERTE</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-4 h-4" /> 30 jours satisfait</span>
            </div>
          </div>
        </section>

        {/* Product Section */}
        <section className="px-6 py-12 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <div>
              <div className="relative mb-4">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary shadow-md' 
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: index === currentImageIndex ? primaryColor : undefined }}
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
            </div>

            {/* Product Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm mb-4">
                <span>⭐ {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ avis)</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {storeData.productName || "Nom du Produit"}
              </h2>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({storeData.reviews || "21 883"} avis vérifiés)</span>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                {storeData.originalPrice && (
                  <span className="text-gray-400 line-through text-xl">
                    {storeData.originalPrice.includes('€') ? storeData.originalPrice : `${storeData.originalPrice}€`}
                  </span>
                )}
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {storeData.productPrice ? (storeData.productPrice.includes('€') ? storeData.productPrice : `${storeData.productPrice}€`) : "49,90€"}
                </span>
                {storeData.originalPrice && storeData.productPrice && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">-29%</span>
                )}
              </div>
              
              {/* Benefits List */}
              <ul className="space-y-3 mb-8">
                {(storeData.benefits?.slice(0, 5) || [
                  "Qualité premium garantie",
                  "Installation facile en 2 minutes",
                  "Résultats visibles immédiatement",
                  "Garantie satisfait ou remboursé 30 jours",
                  "Service client 7j/7"
                ]).map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <button 
                onClick={handleOrder}
                className="w-full text-white text-lg font-bold py-4 rounded-full shadow-lg transition-transform hover:scale-105"
                style={{ background: gradientBg }}
              >
                {storeData.cta || "ACHETER MAINTENANT"}
              </button>
              
              <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Paiement sécurisé</span>
                <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Livraison gratuite</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gray-50 px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-8">
              Pourquoi choisir ce produit ?
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {(storeData.benefitCards || [
                { icon: "💧", title: "Qualité Premium", description: "Matériaux haut de gamme" },
                { icon: "✨", title: "Design Élégant", description: "Style moderne et raffiné" },
                { icon: "🚿", title: "Facile d'Utilisation", description: "Prêt en 2 minutes" },
                { icon: "🛡️", title: "Garantie 1 An", description: "Protection complète" },
              ]).map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="px-6 py-12 max-w-6xl mx-auto">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-8">
            Ce que disent nos clients
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(storeData.customerReviews || [
              { initials: "MC", name: "Marie C.", text: "Résultats visibles dès la première semaine. Ma peau n'a jamais été aussi douce !", rating: 5 },
              { initials: "JD", name: "Jean D.", text: "Installation super simple. Je recommande à 100% ce produit.", rating: 5 },
              { initials: "SL", name: "Sophie L.", text: "Qualité exceptionnelle, je suis ravie de mon achat. Livraison rapide en plus !", rating: 5 },
            ]).map((review, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: gradientBg }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{review.name}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(review.rating || 5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-green-500 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> Vérifié
                  </span>
                </div>
                <p className="text-gray-600 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section 
          className="text-white px-6 py-16 text-center"
          style={{ background: gradientBg }}
        >
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {storeData.finalCtaTitle || `Prêt à découvrir ${storeData.productName || "ce produit"} ?`}
            </h2>
            <p className="text-lg opacity-90 mb-8">Profitez de -29% aujourd'hui seulement</p>
            <button 
              onClick={handleOrder}
              className="bg-white text-lg font-bold px-10 py-4 rounded-full shadow-lg transition-transform hover:scale-105"
              style={{ color: primaryColor }}
            >
              {storeData.cta || "ACHETER MAINTENANT"}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white px-6 py-8 text-center">
          <p className="text-sm opacity-70">© 2025 {storeData.storeName || "Votre Marque"}. Tous droits réservés.</p>
          <p className="text-xs opacity-50 mt-2">Propulsé par Dropyfy</p>
        </footer>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </>
  );
};

export default PublicStore;
