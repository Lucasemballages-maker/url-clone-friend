import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Check, Star, ChevronLeft, ChevronRight, Minus, Plus, Shield, Truck, ArrowLeft, Loader2 } from "lucide-react";
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

const StoreProduct = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<DeployedStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
          const storeData = data.store_data as unknown as StoreData;
          setStore({
            ...data,
            store_data: storeData,
            payment_url: data.payment_url,
            stripe_api_key: data.stripe_api_key ? "configured" : null,
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

  // Parse price
  const priceString = storeData.productPrice || "49.90";
  const priceNumber = parseFloat(priceString.replace(/[^0-9.,]/g, '').replace(',', '.')) || 49.90;
  const totalPrice = (priceNumber * quantity).toFixed(2);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const incrementQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleCheckout = async () => {
    if (!store) return;

    // If store has Stripe API key configured, use dynamic checkout
    if (store.stripe_api_key) {
      setProcessingPayment(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-store-checkout', {
          body: { 
            store_id: store.id,
            quantity: quantity
          }
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
        <title>{storeData.productName || "Produit"} | {storeData.storeName || "Boutique"}</title>
        <meta name="description" content={storeData.description || storeData.headline || "Découvrez notre produit exclusif"} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => navigate(`/store/${subdomain}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <span className="text-xl font-bold" style={{ color: primaryColor }}>
              {storeData.storeName || "Votre Marque"}
            </span>
            <div className="w-20"></div>
          </div>
        </header>

        {/* Product Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <div>
              <div className="relative mb-4 bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full aspect-square object-cover"
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
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white ${
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
              )}
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm mb-4">
                <span>⭐ {storeData.rating || "4.8"} ({storeData.reviews || "21 883"}+ avis)</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {storeData.productName || "Nom du Produit"}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({storeData.reviews || "21 883"} avis vérifiés)</span>
              </div>

              {/* Description */}
              {storeData.description && (
                <p className="text-gray-600 mb-6">{storeData.description}</p>
              )}
              
              {/* Benefits List */}
              <ul className="space-y-2 mb-8">
                {(storeData.benefits?.slice(0, 4) || [
                  "Qualité premium garantie",
                  "Installation facile en 2 minutes",
                  "Garantie satisfait ou remboursé 30 jours",
                ]).map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <hr className="my-6 border-gray-200" />

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                {storeData.originalPrice && (
                  <span className="text-gray-400 line-through text-lg">
                    {storeData.originalPrice.includes('€') ? storeData.originalPrice : `${storeData.originalPrice}€`}
                  </span>
                )}
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {priceNumber.toFixed(2).replace('.', ',')}€
                </span>
                {storeData.originalPrice && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">-29%</span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      onClick={decrementQuantity}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="w-16 text-center text-lg font-semibold">{quantity}</span>
                    <button 
                      onClick={incrementQuantity}
                      className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition"
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">Max: 10 articles</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {totalPrice.replace('.', ',')}€
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Livraison gratuite incluse</p>
              </div>
              
              {/* CTA Button */}
              <button 
                onClick={handleCheckout}
                disabled={processingPayment}
                className="w-full text-white text-lg font-bold py-4 rounded-full shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{ background: gradientBg }}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Payer {totalPrice.replace('.', ',')}€
                  </>
                )}
              </button>
              
              <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Paiement sécurisé</span>
                <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> Livraison gratuite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreProduct;
