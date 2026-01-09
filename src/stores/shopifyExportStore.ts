import { create } from 'zustand';
import { StoreData } from '@/types/store';

interface ShopifyExportState {
  isExporting: boolean;
  exportProgress: number;
  exportStep: string;
  exportedProductId: string | null;
  error: string | null;
  storeData: StoreData | null;
  
  // Actions
  setExporting: (isExporting: boolean) => void;
  setProgress: (progress: number, step: string) => void;
  setExportedProduct: (productId: string) => void;
  setError: (error: string | null) => void;
  setStoreData: (data: StoreData) => void;
  reset: () => void;
}

export const useShopifyExportStore = create<ShopifyExportState>((set) => ({
  isExporting: false,
  exportProgress: 0,
  exportStep: '',
  exportedProductId: null,
  error: null,
  storeData: null,

  setExporting: (isExporting) => set({ isExporting }),
  setProgress: (exportProgress, exportStep) => set({ exportProgress, exportStep }),
  setExportedProduct: (exportedProductId) => set({ exportedProductId }),
  setError: (error) => set({ error }),
  setStoreData: (storeData) => set({ storeData }),
  reset: () => set({
    isExporting: false,
    exportProgress: 0,
    exportStep: '',
    exportedProductId: null,
    error: null,
  }),
}));
