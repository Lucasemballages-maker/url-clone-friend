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
  // Nouveaux champs pour les avis et bienfaits personnalisés
  customerReviews?: ProductReview[];
  benefitCards?: BenefitCard[];
}
