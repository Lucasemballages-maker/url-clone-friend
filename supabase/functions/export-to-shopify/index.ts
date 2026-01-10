import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateThemeFiles, ThemeData } from "./theme-generator.ts";

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
    logStep("Function started - FULL THEME EXPORT");

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
      const { data: connection, error: connError } = await supabaseAdmin
        .from("shopify_connections")
        .select("access_token, shop_domain")
        .eq("user_id", userId)
        .eq("shop_domain", shopDomain)
        .maybeSingle();

      if (connError || !connection) {
        throw new Error("Shopify connection not found for this shop");
      }

      shopifyAccessToken = connection.access_token;
      shopifyStoreDomain = connection.shop_domain;
    } else {
      const { data: connection, error: connError } = await supabaseAdmin
        .from("shopify_connections")
        .select("access_token, shop_domain")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (connError || !connection) {
        throw new Error("No Shopify connection found. Please connect your Shopify store first.");
      }

      shopifyAccessToken = connection.access_token;
      shopifyStoreDomain = connection.shop_domain;
    }

    logStep("Using Shopify connection", { shop: shopifyStoreDomain });

    // ============ STEP 1: CREATE PRODUCT ============
    const productName = storeData.productName || storeData.product?.name || "Product";
    const productDescription = storeData.description || storeData.product?.description || "";
    const productPrice = storeData.price || storeData.productPrice || storeData.product?.price || "0";
    const originalPrice = storeData.originalPrice || storeData.product?.originalPrice || "";
    const productImages = storeData.productImages || storeData.images || storeData.product?.images || [];

    const productData = {
      product: {
        title: productName,
        body_html: `<p>${productDescription}</p>`,
        vendor: storeData.storeName || "Mon Store",
        product_type: "General",
        variants: [
          {
            price: productPrice.toString().replace(/[^0-9.]/g, '') || "0",
            compare_at_price: originalPrice ? originalPrice.toString().replace(/[^0-9.]/g, '') : null,
            sku: `SKU-${Date.now()}`,
            inventory_management: "shopify",
            inventory_quantity: 9999,
          },
        ],
        images: productImages
          .filter((img: { url?: string; selected?: boolean } | string) => {
            if (typeof img === 'string') return img;
            return img.selected !== false && (img.url || img);
          })
          .slice(0, 10)
          .map((img: { url?: string } | string) => ({ 
            src: typeof img === 'string' ? img : img.url 
          })),
      },
    };

    logStep("Creating product in Shopify", { 
      title: productData.product.title,
      price: productData.product.variants[0].price,
      imagesCount: productData.product.images.length 
    });

    const productResponse = await fetch(
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

    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      logStep("Shopify product API error", { status: productResponse.status, error: errorText });
      throw new Error(`Shopify product API error: ${productResponse.status}`);
    }

    const productResult = await productResponse.json();
    logStep("Product created successfully", { productId: productResult.product?.id });

    // ============ STEP 2: CREATE CUSTOM THEME ============
    logStep("Generating custom theme files...");

    // Prepare theme data from storeData
    const themeData: ThemeData = {
      storeName: storeData.storeName || "Ma Boutique",
      productName: productName,
      productPrice: productPrice,
      originalPrice: originalPrice,
      headline: storeData.headline || productName,
      description: productDescription,
      benefits: storeData.benefits || [
        "Qualité premium garantie",
        "Livraison rapide et gratuite",
        "Satisfait ou remboursé 30 jours",
        "Support client 24/7"
      ],
      benefitCards: storeData.benefitCards || [
        { icon: "💎", title: "Qualité Premium", desc: "Matériaux haut de gamme" },
        { icon: "🚀", title: "Livraison Express", desc: "Expédition sous 24h" },
        { icon: "🛡️", title: "Garantie 1 An", desc: "Protection complète" },
        { icon: "💬", title: "Support 24/7", desc: "Équipe dédiée" },
      ],
      customerReviews: storeData.customerReviews || [
        { initials: "MC", name: "Marie C.", text: "Excellent produit, je recommande vivement !", rating: 5 },
        { initials: "JD", name: "Jean D.", text: "Livraison rapide et qualité au top.", rating: 5 },
      ],
      cta: storeData.cta || "ACHETER MAINTENANT",
      primaryColor: storeData.primaryColor || "#4A90E2",
      accentColor: storeData.accentColor || "#764ba2",
      productImages: productImages.map((img: { url?: string } | string) => 
        typeof img === 'string' ? img : img.url
      ).filter(Boolean),
      rating: storeData.rating || "4.8",
      reviews: storeData.reviews || "21 883",
      finalCtaTitle: storeData.finalCtaTitle,
    };

    const themeFiles = generateThemeFiles(themeData);
    logStep("Theme files generated", { fileCount: Object.keys(themeFiles).length });

    // ============ STEP 3: CREATE NEW THEME IN SHOPIFY ============
    const themeName = `${storeData.storeName || 'Store'} - Custom Theme`;
    
    const createThemeResponse = await fetch(
      `https://${shopifyStoreDomain}/admin/api/2024-01/themes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
        body: JSON.stringify({
          theme: {
            name: themeName,
            role: "unpublished",
          }
        }),
      }
    );

    let themeId: number | null = null;
    let themeUploaded = false;

    if (createThemeResponse.ok) {
      const themeResult = await createThemeResponse.json();
      themeId = themeResult.theme?.id;
      logStep("New theme created", { themeId, name: themeName });

      // ============ STEP 4: UPLOAD THEME FILES ============
      for (const [key, content] of Object.entries(themeFiles)) {
        try {
          const assetResponse = await fetch(
            `https://${shopifyStoreDomain}/admin/api/2024-01/themes/${themeId}/assets.json`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": shopifyAccessToken,
              },
              body: JSON.stringify({
                asset: {
                  key: key,
                  value: content,
                }
              }),
            }
          );

          if (assetResponse.ok) {
            logStep(`Uploaded: ${key}`);
          } else {
            const error = await assetResponse.text();
            logStep(`Failed to upload ${key}`, { error });
          }
        } catch (err) {
          logStep(`Error uploading ${key}`, { error: String(err) });
        }
      }

      themeUploaded = true;

      // ============ STEP 5: PUBLISH THE THEME ============
      logStep("Publishing theme...");
      
      const publishResponse = await fetch(
        `https://${shopifyStoreDomain}/admin/api/2024-01/themes/${themeId}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": shopifyAccessToken,
          },
          body: JSON.stringify({
            theme: {
              id: themeId,
              role: "main",
            }
          }),
        }
      );

      if (publishResponse.ok) {
        logStep("Theme published successfully!");
      } else {
        const pubError = await publishResponse.text();
        logStep("Theme publish failed (may need manual activation)", { error: pubError });
      }

    } else {
      const themeError = await createThemeResponse.text();
      logStep("Could not create theme", { error: themeError });
    }

    return new Response(
      JSON.stringify({
        success: true,
        productId: productResult.product?.id,
        productHandle: productResult.product?.handle,
        productUrl: `https://${shopifyStoreDomain}/products/${productResult.product?.handle}`,
        shopDomain: shopifyStoreDomain,
        storeUrl: `https://${shopifyStoreDomain}`,
        themeId,
        themeUploaded,
        message: themeUploaded 
          ? "🎉 Boutique complète exportée ! Produit + thème personnalisé créés et publiés." 
          : "Produit créé ! Le thème personnalisé nécessite une configuration manuelle.",
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
