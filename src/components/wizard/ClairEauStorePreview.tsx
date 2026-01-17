import { ShoppingCart, Star, Check, ChevronLeft, ChevronRight, Menu, Plus, Minus } from "lucide-react";
import { StoreData } from "@/types/store";
import { useState, useEffect } from "react";

interface ClairEauStorePreviewProps {
  storeData: StoreData;
}

export const ClairEauStorePreview = ({ storeData }: ClairEauStorePreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const images = storeData.productImages.length > 0 ? storeData.productImages : ["/placeholder.svg"];
  const mainImage = images[currentImageIndex] || "/placeholder.svg";

  const primaryColor = "#3B82F6"; // Blue as specified
  const darkBlue = "#1E40AF";

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const defaultFaq = [
    { question: "À QUELLE FRÉQUENCE CHANGER LE FILTRE ?", answer: "Nous recommandons de changer le filtre tous les 3 mois pour des performances optimales." },
    { question: "L'INSTALLATION EST-ELLE FACILE ?", answer: "Oui ! L'installation se fait en 2 minutes sans outils. Compatible avec tous les raccords standard." },
    { question: "QUELS SONT LES DÉLAIS DE LIVRAISON ?", answer: "Livraison gratuite en 2-4 jours ouvrés en France métropolitaine." },
    { question: "PROPOSEZ-VOUS UNE GARANTIE ?", answer: "Oui, tous nos produits sont garantis 1 an. Satisfait ou remboursé pendant 30 jours." },
  ];

  const faqItems = storeData.faq || defaultFaq;

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
              {storeData.storeName ? `${storeData.storeName.toLowerCase().replace(/\s+/g, '-')}.com` : 'votre-boutique.com'}
            </span>
          </div>
        </div>
        
        {/* Site Content */}
        <div className="bg-white overflow-hidden">
          {/* Scrollable Content */}
          <div className="h-[520px] overflow-y-auto scrollbar-hide">
            
            {/* SECTION 1: Header Sticky */}
            {/* Top Banner - Blue thin */}
            <div className="py-2 px-3 text-center" style={{ backgroundColor: primaryColor }}>
              <span className="text-white text-[9px] font-medium">
                {storeData.announcementBar || `Livraison OFFERTE | Noté ${storeData.rating || "4.8"}/5 d'après + de ${storeData.reviews || "20 000"} clients`}
              </span>
            </div>

            {/* Header - White, 60px height, sticky */}
            <header className="bg-white px-4 py-3 sticky top-0 z-20 border-b border-gray-100" style={{ height: '50px' }}>
              <div className="flex justify-between items-center h-full">
                {/* Hamburger */}
                <Menu className="w-5 h-5 text-zinc-700" />
                
                {/* Logo centered */}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-zinc-800">
                    {storeData.storeName || "Votre Marque"}™
                  </span>
                </div>
                
                {/* Cart */}
                <ShoppingCart className="w-5 h-5 text-zinc-700" />
              </div>
            </header>

            {/* SECTION 2: Hero Section */}
            <section className="bg-white">
              {/* Product Image - Large */}
              <div className="relative">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full aspect-[4/5] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronLeft className="w-4 h-4 text-zinc-600" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </button>
                  </>
                )}
              </div>

              {/* Hero Content */}
              <div className="px-4 py-6 text-center">
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px]" style={{ color: primaryColor }}>
                    Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                  </span>
                </div>

                {/* Title H1 - Very large */}
                <h1 className="text-2xl font-black text-zinc-900 mb-4 leading-tight">
                  {storeData.headline || storeData.productName || "Douche Purifiée Quotidienne"}
                </h1>

                {/* Feature badges - Blue with icons */}
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {(storeData.benefits?.slice(0, 2) || [
                    "Filtre chlore et métaux lourds",
                    "Installation en 2 minutes"
                  ]).map((benefit, i) => (
                    <div 
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-medium"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      <Check className="w-3 h-3" />
                      {benefit}
                    </div>
                  ))}
                </div>

                {/* Guarantee badge - Round */}
                <div 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-medium mb-4"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  <Check className="w-3 h-3" />
                  {storeData.benefits?.[2] || "Garantie 1 an incluse"}
                </div>

                {/* CTA Button - Big blue rounded */}
                <button 
                  className="w-full text-white text-sm font-bold py-4 mb-3"
                  style={{ backgroundColor: primaryColor, borderRadius: '50px' }}
                >
                  {storeData.cta || "ACHETER MAINTENANT"}
                </button>

                {/* Trust badges */}
                <div className="flex justify-center gap-4 text-[10px]" style={{ color: primaryColor }}>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Essai sans risque
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Livraison OFFERTE
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 3: USP - "Votre eau cache des impuretés invisibles" */}
            <section className="bg-white px-4 py-8 text-center">
              {/* Rating badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-gray-300 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] underline" style={{ color: primaryColor }}>
                  Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                </span>
              </div>

              <h2 className="text-xl font-black text-zinc-900 mb-3">
                Votre eau cache des impuretés invisibles
              </h2>
              <p className="text-[11px] text-zinc-600 leading-relaxed mb-6">
                Chlore, métaux lourds, rouille: ils agressent votre peau chaque jour. {storeData.storeName || "Notre filtre"} filtre tout. Résultat? Beauté naturelle.
              </p>

              {/* Two images side by side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                  <img
                    src={images[0] || "/placeholder.svg"}
                    alt="Produit"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                  {/* Annotations */}
                  <div className="absolute top-4 right-2 text-[8px] text-white bg-black/50 px-2 py-1 rounded">
                    2X plus de pression
                  </div>
                  <div className="absolute bottom-4 left-2 text-[8px] text-white bg-black/50 px-2 py-1 rounded">
                    Assembler en 1 minute
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                  <img
                    src={images[1] || images[0] || "/placeholder.svg"}
                    alt="Lifestyle"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                </div>
              </div>
            </section>

            {/* SECTION 4: "Ce qui rend notre site différent" */}
            <section className="px-4 py-8 text-center" style={{ backgroundColor: '#F9FAFB' }}>
              <h2 className="text-xl font-black text-zinc-900 mb-3">
                Ce qui rend notre site différent
              </h2>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Filtration supérieure qui élimine 99% du chlore. Résultats visibles dès la première douche.
              </p>
            </section>

            {/* SECTION 5: Product + Price */}
            <section className="bg-white px-4 py-6">
              {/* Thumbnails carousel */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {images.slice(0, 6).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-blue-400' 
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vue ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </button>
                ))}
              </div>

              {/* Main product image */}
              <div className="relative mb-4">
                <img
                  src={mainImage}
                  alt={storeData.productName}
                  className="w-full aspect-square object-cover rounded-xl"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: primaryColor }}>
                  Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                </span>
              </div>

              {/* Product title */}
              <h2 className="text-lg font-black text-zinc-900 mb-2">
                {storeData.storeName || "Clair'Eau"} | Pour une douche saine
              </h2>

              {/* Price - Huge */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  {storeData.productPrice ? (storeData.productPrice.includes('€') ? storeData.productPrice : `${storeData.productPrice}€`) : "49,90€"}
                </span>
                {storeData.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    {storeData.originalPrice.includes('€') ? storeData.originalPrice : `${storeData.originalPrice}€`}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mb-4">
                Taxes incluses. <span className="underline">Frais d'expédition</span> calculés à l'étape de paiement.
              </p>

              {/* Add to cart button */}
              <button 
                className="w-full text-white text-sm font-bold py-4 mb-3"
                style={{ backgroundColor: primaryColor, borderRadius: '50px' }}
              >
                Ajouter au panier
              </button>

              {/* View options link */}
              <a 
                href="#" 
                className="flex items-center justify-start gap-1 text-[11px] font-semibold underline"
                style={{ color: darkBlue }}
              >
                VOIR LES OPTIONS →
              </a>
            </section>

            {/* SECTION 6: Beauty/Benefit */}
            <section className="bg-white">
              {/* Lifestyle image */}
              <img
                src={images[1] || images[0] || "/placeholder.svg"}
                alt="Lifestyle"
                className="w-full aspect-[4/3] object-cover"
                onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
              />
              
              <div className="px-4 py-6">
                <h2 className="text-xl font-black text-zinc-900 mb-3">
                  Chaque Douche Devient Un Soin Beauté Professionnel
                </h2>
                <p className="text-[11px] text-zinc-600 leading-relaxed mb-4">
                  Transformez votre routine avec une eau purifiée qui respecte votre peau et sublime vos cheveux. Douceur et éclat garantis dès aujourd'hui.
                </p>

                {/* CTA Button */}
                <button 
                  className="w-full text-white text-sm font-bold py-4 mb-3"
                  style={{ backgroundColor: primaryColor, borderRadius: '50px' }}
                >
                  ACHETER MAINTENANT
                </button>

                {/* Trust badges */}
                <div className="flex justify-center gap-3 text-[9px]" style={{ color: primaryColor }}>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Essai sans risque
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Livraison gratuite
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Retours sans tracas
                  </span>
                </div>
              </div>
            </section>

            {/* SECTION 7: Technical - "Votre peau mérite une eau pure" */}
            <section className="px-4 py-8" style={{ backgroundColor: '#F9FAFB' }}>
              {/* Rating badge */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-gray-300 bg-white">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] underline" style={{ color: primaryColor }}>
                    Noté {storeData.rating || "4,8"} ({storeData.reviews || "21 883"}+ clients satisfaits)
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-black text-zinc-900 mb-3 text-center">
                Votre peau mérite une eau pure
              </h2>
              <p className="text-[11px] text-zinc-600 leading-relaxed text-center mb-6">
                Filtrez les impuretés. Révélez votre éclat naturel chaque jour.
              </p>

              {/* Technical product image with annotations */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-800 aspect-[4/5]">
                <img
                  src={images[0] || "/placeholder.svg"}
                  alt="Technical view"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
                {/* Annotations */}
                <div className="absolute top-8 right-4 text-[9px] text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  2X plus de pression
                </div>
                <div className="absolute top-1/3 left-4 text-[9px] text-white flex items-center gap-1">
                  Changer tous les 3 mois
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
                <div className="absolute bottom-1/3 right-4 text-[9px] text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  1 an de garantie
                </div>
                <div className="absolute bottom-8 left-4 text-[9px] text-white flex items-center gap-1">
                  Assembler en 1 minute
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
              </div>
            </section>

            {/* SECTION 8: FAQ Accordion */}
            <section className="bg-white px-4 py-8">
              <h2 className="text-xl font-black text-zinc-900 mb-6">
                Questions fréquemment posées
              </h2>

              <div className="space-y-0">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                      <span className="text-[11px] font-semibold" style={{ color: primaryColor }}>
                        {item.question}
                      </span>
                      {openFaq === index ? (
                        <Minus className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                      ) : (
                        <Plus className="w-4 h-4 flex-shrink-0" style={{ color: primaryColor }} />
                      )}
                    </button>
                    {openFaq === index && (
                      <div className="pb-4">
                        <p className="text-[10px] text-zinc-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 9: Footer Simple */}
            <footer className="bg-zinc-900 text-white px-4 py-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-[10px] font-bold mb-2">Navigation</h4>
                  <ul className="space-y-1 text-[9px] text-zinc-400">
                    <li>Accueil</li>
                    <li>Produits</li>
                    <li>À propos</li>
                    <li>Contact</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold mb-2">Légal</h4>
                  <ul className="space-y-1 text-[9px] text-zinc-400">
                    <li>Mentions légales</li>
                    <li>CGV</li>
                    <li>Politique de confidentialité</li>
                    <li>Retours & remboursements</li>
                  </ul>
                </div>
              </div>

              {/* Newsletter */}
              <div className="border-t border-zinc-700 pt-4 mb-4">
                <h4 className="text-[10px] font-bold mb-2">Newsletter</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Votre email"
                    className="flex-1 bg-zinc-800 text-[10px] px-3 py-2 rounded-full border border-zinc-700"
                  />
                  <button 
                    className="text-[10px] font-bold px-4 py-2 text-white"
                    style={{ backgroundColor: primaryColor, borderRadius: '50px' }}
                  >
                    OK
                  </button>
                </div>
              </div>

              <p className="text-[8px] text-zinc-500 text-center">
                © 2025 {storeData.storeName || "Votre Marque"}. Tous droits réservés.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClairEauStorePreview;
