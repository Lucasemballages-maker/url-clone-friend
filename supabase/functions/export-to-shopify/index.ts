import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized - No auth token provided");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized - Invalid token");
    }
    
    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const { storeData, shopDomain } = await req.json();
    logStep("Store data received", { 
      productName: storeData?.productName || storeData?.product?.name,
      storeName: storeData?.storeName,
      shopDomain
    });

    if (!storeData) {
      throw new Error("No store data provided");
    }

    // Get Shopify connection from database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    let shopifyAccessToken: string;
    let shopifyStoreDomain: string;

    if (shopDomain) {
      // Use provided shop domain
      const { data: connection, error: connError } = await supabaseAdmin
        .from("shopify_connections")
        .select("access_token, shop_domain")
        .eq("user_id", userId)
        .eq("shop_domain", shopDomain)
        .maybeSingle();

      if (connError || !connection) {
        logStep("No connection found for shop", { shopDomain, error: connError });
        throw new Error("Shopify connection not found for this shop");
      }

      shopifyAccessToken = connection.access_token;
      shopifyStoreDomain = connection.shop_domain;
    } else {
      // Get first available connection for user
      const { data: connection, error: connError } = await supabaseAdmin
        .from("shopify_connections")
        .select("access_token, shop_domain")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (connError || !connection) {
        logStep("No connection found", { error: connError });
        throw new Error("No Shopify connection found. Please connect your Shopify store first.");
      }

      shopifyAccessToken = connection.access_token;
      shopifyStoreDomain = connection.shop_domain;
    }

    logStep("Using Shopify connection", { shop: shopifyStoreDomain });

    // Prepare product data
    const productName = storeData.productName || storeData.product?.name || "Product";
    const productDescription = storeData.description || storeData.product?.description || "";
    const productPrice = storeData.price || storeData.product?.price || "0";
    const productImages = storeData.images || storeData.product?.images || [];

    const productData = {
      product: {
        title: productName,
        body_html: `<p>${productDescription}</p>`,
        vendor: storeData.storeName || "Mon Store",
        product_type: "General",
        variants: [
          {
            price: productPrice.toString().replace(/[^0-9.]/g, ''),
            sku: `SKU-${Date.now()}`,
            inventory_management: "shopify",
            inventory_quantity: 9999,
          },
        ],
        images: productImages
          .filter((img: { url?: string; selected?: boolean } | string) => {
            if (typeof img === 'string') return img;
            return img.selected !== false && img.url;
          })
          .map((img: { url?: string } | string) => ({ 
            src: typeof img === 'string' ? img : img.url 
          })),
      },
    };

    logStep("Creating product in Shopify", { 
      title: productData.product.title,
      imagesCount: productData.product.images.length 
    });

    const response = await fetch(
      `https://${shopifyStoreDomain}/admin/api/2024-01/products.json`,
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
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logStep("Product created successfully", { productId: result.product?.id });

    return new Response(
      JSON.stringify({
        success: true,
        productId: result.product?.id,
        productHandle: result.product?.handle,
        productUrl: `https://${shopifyStoreDomain}/products/${result.product?.handle}`,
        shopDomain: shopifyStoreDomain,
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
