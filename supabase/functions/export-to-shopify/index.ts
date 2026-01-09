import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Shopify from "https://esm.sh/@shopify/shopify-api@11.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-TO-SHOPIFY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { storeData } = await req.json();
    logStep("Store data received", { 
      productName: storeData?.product?.name,
      storeName: storeData?.storeName 
    });

    if (!storeData || !storeData.product) {
      throw new Error("No store data provided");
    }

    const shopifyAccessToken = Deno.env.get("SHOPIFY_ADMIN_ACCESS_TOKEN");
    const shopifyStoreDomain = Deno.env.get("SHOPIFY_STORE_PERMANENT_DOMAIN");

    if (!shopifyAccessToken || !shopifyStoreDomain) {
      throw new Error("Shopify credentials not configured");
    }

    logStep("Creating product in Shopify");

    // Create product via Shopify Admin API
    const productData = {
      product: {
        title: storeData.product.name,
        body_html: `<p>${storeData.product.description}</p>`,
        vendor: storeData.storeName || "Mon Store",
        product_type: "General",
        variants: [
          {
            price: storeData.product.price?.toString() || "0",
            sku: `SKU-${Date.now()}`,
            inventory_management: "shopify",
            inventory_quantity: 100,
          },
        ],
        images: storeData.product.images
          ?.filter((img: { url: string; selected: boolean }) => img.selected && img.url)
          .map((img: { url: string }) => ({ src: img.url })) || [],
      },
    };

    const response = await fetch(
      `https://${shopifyStoreDomain}/admin/api/2025-01/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
        body: JSON.stringify(productData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Shopify API error", { status: response.status, error: errorText });
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const result = await response.json();
    logStep("Product created successfully", { productId: result.product?.id });

    return new Response(
      JSON.stringify({
        success: true,
        productId: result.product?.id,
        productHandle: result.product?.handle,
        productUrl: `https://${shopifyStoreDomain}/products/${result.product?.handle}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
