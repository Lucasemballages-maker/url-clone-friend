export interface ProductReview {
  name: string;
  initials: string;
  text: string;
  rating: number;
}

export interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

export interface StoreData {
  storeName: string;
  productName: string;
  headline: string;
  description: string;
  benefits: string[];
  cta: string;
  productPrice: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  productImages: string[];
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  announcementBar: string;
  // Avis et bienfaits personnalisés
  customerReviews?: ProductReview[];  // Avis page produit
  homeReviews?: ProductReview[];      // Avis page d'accueil
  benefitCards?: BenefitCard[];
}
