import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { StoreData } from "@/types/store";
import { Json } from "@/integrations/supabase/types";

export interface HistoryItem {
  id: string;
  productName: string;
  productUrl: string;
  productImage: string;
  language: string;
  type: string;
  updatedAt: string;
  storeData?: StoreData;
}

export const useStoreHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("store_configurations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formattedHistory: HistoryItem[] = (data || []).map((item) => ({
        id: item.id,
        productName: item.product_name.length > 25 
          ? item.product_name.substring(0, 25) + "..." 
          : item.product_name,
        productUrl: item.product_url,
        productImage: item.product_image || "",
        language: item.language,
        type: item.type,
        updatedAt: formatTimeAgo(new Date(item.updated_at)),
        storeData: item.store_data as unknown as StoreData | undefined,
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async (
    productName: string,
    productUrl: string,
    productImage: string,
    language: string,
    storeData: StoreData
  ) => {
    if (!user) return null;

    try {
      // Check if configuration already exists for this URL
      const { data: existing } = await supabase
        .from("store_configurations")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_url", productUrl)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("store_configurations")
          .update({
            product_name: productName,
            product_image: productImage,
            language,
            store_data: storeData as unknown as Json,
          })
          .eq("id", existing.id);

        if (error) throw error;
        await fetchHistory();
        return existing.id;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("store_configurations")
          .insert({
            user_id: user.id,
            product_name: productName,
            product_url: productUrl,
            product_image: productImage,
            language,
            type: "Boutique",
            store_data: storeData as unknown as Json,
          })
          .select("id")
          .single();

        if (error) throw error;
        await fetchHistory();
        return data.id;
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      return null;
    }
  };

  const deleteConfiguration = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("store_configurations")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchHistory();
      return true;
    } catch (error) {
      console.error("Error deleting configuration:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return {
    history,
    loading,
    saveConfiguration,
    deleteConfiguration,
    refreshHistory: fetchHistory,
  };
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "il y a quelques secondes";
  if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 604800) return `il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  
  return date.toLocaleDateString("fr-FR");
}
