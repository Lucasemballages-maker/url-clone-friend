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
};
