import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateLandingPageHTML } from "./page-generator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FULL-SHOPIFY-STORE] ${step}${detailsStr}`);
};

const SHOPIFY_API_VERSION = "2024-01";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("=== CREATE FULL SHOPIFY STORE ===");

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

    const { storeData, shopDomain, storefrontToken } = await req.json();
    
    logStep("Request data received", { 
      productName: storeData?.productName || storeData?.product?.name,
      storeName: storeData?.storeName,
      shopDomain,
      hasToken: !!storefrontToken
    });

    if (!storeData) {
      throw new Error("No store data provided");
    }

    if (!shopDomain) {
      throw new Error("No Shopify shop domain provided");
    }

    if (!storefrontToken) {
      throw new Error("No Storefront Access Token provided");
    }

    // Clean shop domain
    let cleanShopDomain = shopDomain.trim().toLowerCase();
    if (!cleanShopDomain.includes('.myshopify.com')) {
      cleanShopDomain = `${cleanShopDomain}.myshopify.com`;
    }

    logStep("Using Shopify store", { shop: cleanShopDomain });

    // Shopify Admin API helper - using the storefront token for admin calls
    // Note: For full admin access, we'd need an Admin API token
    // The storefront token allows limited operations
    const shopifyApi = async (endpoint: string, method: string, body?: unknown) => {
      const response = await fetch(
        `https://${cleanShopDomain}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": storefrontToken,
          },
          body: body ? JSON.stringify(body) : undefined,
        }
      );
      
      const text = await response.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text };
      }
      
      return { ok: response.ok, status: response.status, data: json };
    };

    // ============ STEP 1: CREATE PRODUCT WITH ALL IMAGES AND VARIANTS ============
    logStep("STEP 1: Creating product with all images...");
    
    const productName = storeData.productName || storeData.product?.name || "Product";
    const productDescription = storeData.description || storeData.product?.description || "";
    const productPrice = storeData.productPrice || storeData.price || storeData.product?.price || "0";
    const originalPrice = storeData.originalPrice || storeData.product?.originalPrice || "";
    const productImages = storeData.productImages || storeData.images || storeData.product?.images || [];

    // Prepare images array
    const imagesArray = productImages
      .filter((img: { url?: string; selected?: boolean } | string) => {
        if (typeof img === 'string') return img && img.startsWith('http');
        return img.selected !== false && img.url && img.url.startsWith('http');
      })
      .slice(0, 10)
      .map((img: { url?: string } | string) => ({ 
        src: typeof img === 'string' ? img : img.url 
      }));

    const productData = {
      product: {
        title: productName,
        body_html: `<p>${productDescription}</p>`,
        vendor: storeData.storeName || "Mon Store",
        product_type: "General",
        status: "active",
        published: true,
        variants: [
          {
            price: productPrice.toString().replace(/[^0-9.]/g, '') || "0",
            compare_at_price: originalPrice ? originalPrice.toString().replace(/[^0-9.]/g, '') : null,
            sku: `SKU-${Date.now()}`,
            inventory_management: "shopify",
            inventory_quantity: 9999,
            inventory_policy: "continue",
            fulfillment_service: "manual",
            requires_shipping: true,
          },
        ],
        images: imagesArray,
        options: [
          { name: "Taille", values: ["Standard"] }
        ],
      },
    };

    logStep("Creating product", { 
      title: productData.product.title,
      price: productData.product.variants[0].price,
      imagesCount: productData.product.images.length 
    });

    const productResult = await shopifyApi("/products.json", "POST", productData);

    if (!productResult.ok) {
      logStep("Product creation failed", productResult.data);
      
      // Check for specific error types
      if (productResult.status === 401 || productResult.status === 403) {
        throw new Error("Token invalide ou permissions insuffisantes. Assurez-vous d'avoir créé une app avec les permissions Admin API.");
      }
      
      throw new Error(`Échec création produit: ${JSON.stringify(productResult.data)}`);
    }

    const createdProduct = productResult.data.product;
    const productId = createdProduct.id;
    const productHandle = createdProduct.handle;
    const variantId = createdProduct.variants[0]?.id;
    
    logStep("Product created successfully", { productId, productHandle, variantId });

    // ============ STEP 2: CREATE CUSTOM PAGE WITH LANDING HTML ============
    logStep("STEP 2: Creating custom landing page...");

    const pageHandle = `${productHandle}-landing`;
    const landingHTML = generateLandingPageHTML({
      storeName: storeData.storeName || "Ma Boutique",
      productName,
      productPrice,
      originalPrice,
      headline: storeData.headline || productName,
      description: productDescription,
      benefits: storeData.benefits || ["Qualité premium", "Livraison rapide", "Garantie satisfait"],
      benefitCards: storeData.benefitCards || [
        { icon: "💎", title: "Qualité Premium", desc: "Matériaux haut de gamme" },
        { icon: "🚀", title: "Livraison Express", desc: "Expédition sous 24h" },
        { icon: "🛡️", title: "Garantie 1 An", desc: "Protection complète" },
        { icon: "💬", title: "Support 24/7", desc: "Équipe dédiée" },
      ],
      customerReviews: storeData.customerReviews || [
        { initials: "MC", name: "Marie C.", text: "Excellent produit, je recommande !", rating: 5 },
        { initials: "JD", name: "Jean D.", text: "Livraison rapide et qualité au top.", rating: 5 },
      ],
      cta: storeData.cta || "ACHETER MAINTENANT",
      primaryColor: storeData.primaryColor || "#4A90E2",
      accentColor: storeData.accentColor || "#764ba2",
      productImages: imagesArray.map((img: { src: string }) => img.src),
      rating: storeData.rating || "4.8",
      reviews: storeData.reviews || "21 883",
      shopDomain: cleanShopDomain,
      productHandle,
      variantId: variantId?.toString() || "",
    });

    const pageData = {
      page: {
        title: productName,
        handle: pageHandle,
        body_html: landingHTML,
        published: true,
      }
    };

    const pageResult = await shopifyApi("/pages.json", "POST", pageData);

    let pageId = null;
    let pageUrl = `https://${cleanShopDomain}/pages/${pageHandle}`;

    if (pageResult.ok) {
      pageId = pageResult.data.page?.id;
      logStep("Landing page created", { pageId, pageHandle });
    } else {
      logStep("Page creation failed, might already exist", pageResult.data);
      // Try to update existing page
      const existingPagesResult = await shopifyApi(`/pages.json?handle=${pageHandle}`, "GET");
      if (existingPagesResult.ok && existingPagesResult.data.pages?.length > 0) {
        const existingPage = existingPagesResult.data.pages[0];
        const updateResult = await shopifyApi(`/pages/${existingPage.id}.json`, "PUT", pageData);
        if (updateResult.ok) {
          pageId = existingPage.id;
          logStep("Existing page updated", { pageId });
        }
      }
    }

    // ============ STEP 3: ENSURE PRODUCT IS PUBLISHED ============
    logStep("STEP 3: Ensuring product is published...");

    const publishResult = await shopifyApi(`/products/${productId}.json`, "PUT", {
      product: {
        id: productId,
        status: "active",
        published_at: new Date().toISOString(),
      }
    });

    if (publishResult.ok) {
      logStep("Product published successfully");
    }

    // ============ STEP 4: SAVE EXPORT RECORD ============
    logStep("STEP 4: Saving export record...");

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
      await supabaseAdmin
        .from("store_configurations")
        .upsert({
          user_id: userId,
          product_name: productName,
          product_url: `https://${cleanShopDomain}/products/${productHandle}`,
          product_image: imagesArray[0]?.src || null,
          store_data: storeData,
          type: "shopify_full_export",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,product_url",
        });
      logStep("Export record saved");
    } catch (err) {
      logStep("Warning: Could not save export record", { error: String(err) });
    }

    // ============ SUCCESS RESPONSE ============
    const response = {
      success: true,
      productId,
      productHandle,
      productUrl: `https://${cleanShopDomain}/products/${productHandle}`,
      pageId,
      pageHandle,
      pageUrl,
      shopDomain: cleanShopDomain,
      storeUrl: `https://${cleanShopDomain}`,
      variantId,
      checkoutUrl: `https://${cleanShopDomain}/cart/${variantId}:1`,
      message: `✅ Votre boutique est prête ! Visitez : ${pageUrl}`,
    };

    logStep("=== STORE CREATION COMPLETED SUCCESSFULLY ===", response);

    return new Response(
      JSON.stringify(response),
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
