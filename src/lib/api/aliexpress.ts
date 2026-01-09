import { supabase } from '@/integrations/supabase/client';

export interface AliExpressProduct {
  title: string;
  description: string;
  images: string[];
  price: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  sourceUrl: string;
}

export interface ScrapeResponse {
  success: boolean;
  error?: string;
  data?: AliExpressProduct;
}

export interface GenerateImageResponse {
  success: boolean;
  error?: string;
  data?: {
    imageUrl: string;
    style: string;
  };
}

export interface ReformulatedProduct {
  title: string;
  headline: string;
  description: string;
  benefits: string[];
  cta: string;
}

export interface ReformulateResponse {
  success: boolean;
  error?: string;
  data?: ReformulatedProduct;
}

export type ImageStyle = 'lifestyle' | 'studio' | 'outdoor' | 'minimal';

export const aliexpressApi = {
  async scrapeProduct(url: string): Promise<ScrapeResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-aliexpress', {
        body: { url },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error scraping AliExpress:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape product' 
      };
    }
  },

  async generateProductImage(
    imageUrl: string,
    productName: string,
    style: ImageStyle = 'lifestyle'
  ): Promise<GenerateImageResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-image', {
        body: { imageUrl, productName, style },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error generating image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image',
      };
    }
  },

  async reformulateProduct(
    title: string,
    description: string,
    language: string = 'fr'
  ): Promise<ReformulateResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('reformulate-product', {
        body: { title, description, language },
      });

      if (error) {
        console.error('Supabase function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error reformulating product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reformulate product',
      };
    }
  },
};
