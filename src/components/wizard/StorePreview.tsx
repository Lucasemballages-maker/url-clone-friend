import { ShoppingCart, User, Star, Check } from "lucide-react";
import { StoreData } from "@/types/store";

interface StorePreviewProps {
  storeData: StoreData;
}

export const StorePreview = ({ storeData }: StorePreviewProps) => {
  const mainImage = storeData.productImages[0] || "/placeholder.svg";

  return (
    <div className="w-full bg-white text-gray-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Announcement Bar */}
      <div 
        className="text-center py-2 px-4 text-sm text-white"
        style={{ backgroundColor: storeData.primaryColor }}
      >
        {storeData.announcementBar}
      </div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-8">
          <span className="text-sm font-medium text-gray-600 border-b-2 border-gray-900">ACCUEIL</span>
          <span className="text-sm text-gray-500">{storeData.storeName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold" style={{ color: storeData.primaryColor }}>
            💧 {storeData.storeName}™
          </span>
        </div>
        <div className="flex items-center gap-4">
          <User className="w-5 h-5 text-gray-600" />
          <ShoppingCart className="w-5 h-5 text-gray-600" />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="grid md:grid-cols-2 min-h-[400px]">
        {/* Left Content */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-4 h-4" 
                  fill={star <= 4 ? storeData.primaryColor : "none"}
                  stroke={storeData.primaryColor}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: storeData.primaryColor }}>
              Noté {storeData.rating} ({storeData.reviews}+ clients satisfaits)
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {storeData.headline || storeData.productName}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {storeData.description}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap gap-2 mb-6">
            {storeData.benefits.map((benefit, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border" 
                style={{ borderColor: storeData.primaryColor, color: storeData.primaryColor }}
              >
                <Check className="w-3 h-3" /> {benefit}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <button 
            className="w-full md:w-auto px-8 py-4 rounded-full text-white font-semibold text-lg mb-4 uppercase"
            style={{ backgroundColor: storeData.primaryColor }}
          >
            {storeData.cta}
          </button>

          {/* Trust badges */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" style={{ color: storeData.primaryColor }} /> Essayez sans risque
            </span>
            <span style={{ color: storeData.primaryColor }}>Livraison OFFERTE</span>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative bg-gray-100">
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

      {/* Product Images Gallery */}
      {storeData.productImages.length > 1 && (
        <div className="border-t border-gray-100 p-6">
          <div className="flex gap-4 overflow-x-auto">
            {storeData.productImages.slice(0, 4).map((img, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2"
                style={{ borderColor: index === 0 ? storeData.primaryColor : 'transparent' }}
              >
                <img
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Section */}
      <div className="border-t border-gray-100 p-6 flex items-center justify-between bg-gray-50">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold" style={{ color: storeData.primaryColor }}>
              {storeData.productPrice}€
            </span>
            <span className="text-lg text-gray-400 line-through">
              {storeData.originalPrice}€
            </span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            Économisez {(parseFloat(storeData.originalPrice) - parseFloat(storeData.productPrice)).toFixed(2)}€
          </p>
        </div>
        <button 
          className="px-6 py-3 rounded-full text-white font-semibold"
          style={{ backgroundColor: storeData.primaryColor }}
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
};

export default StorePreview;
