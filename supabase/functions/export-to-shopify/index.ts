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

// Convert HSL or hex to Shopify-compatible hex format
function toHex(color: string): string {
  if (!color) return "#000000";
  
  // If already hex, return as-is
  if (color.startsWith("#")) return color;
  
  // Handle HSL format
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHexPart = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHexPart(r)}${toHexPart(g)}${toHexPart(b)}`;
  }
  
  return "#000000";
}

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
      shopDomain,
      hasTheme: !!storeData?.theme
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
        logStep("No connection found for shop", { shopDomain, error: connError });
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
        logStep("No connection found", { error: connError });
        throw new Error("No Shopify connection found. Please connect your Shopify store first.");
      }

      shopifyAccessToken = connection.access_token;
      shopifyStoreDomain = connection.shop_domain;
    }

    logStep("Using Shopify connection", { shop: shopifyStoreDomain });

    // ============ STEP 1: CREATE PRODUCT ============
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
      throw new Error(`Shopify product API error: ${productResponse.status} - ${errorText}`);
    }

    const productResult = await productResponse.json();
    logStep("Product created successfully", { productId: productResult.product?.id });

    // ============ STEP 2: GET ACTIVE THEME ============
    const themesResponse = await fetch(
      `https://${shopifyStoreDomain}/admin/api/2024-01/themes.json`,
      {
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken,
        },
      }
    );

    let themeConfigured = false;
    let activeThemeId: number | null = null;

    if (themesResponse.ok) {
      const themesResult = await themesResponse.json();
      const activeTheme = themesResult.themes?.find((t: { role: string }) => t.role === "main");
      
      if (activeTheme) {
        activeThemeId = activeTheme.id;
        logStep("Found active theme", { themeId: activeThemeId, name: activeTheme.name });

        // ============ STEP 3: CONFIGURE THEME SETTINGS ============
        // Extract colors from storeData
        const theme = storeData.theme || {};
        const primaryColor = toHex(theme.primaryColor || "#4F46E5");
        const backgroundColor = toHex(theme.backgroundColor || "#FFFFFF");
        const textColor = toHex(theme.textColor || "#1F2937");
        const accentColor = toHex(theme.accentColor || primaryColor);

        // Shopify 2.0 theme settings structure
        const themeSettings = {
          asset: {
            key: "config/settings_data.json",
            value: JSON.stringify({
              current: {
                // Common theme settings
                colors_solid_button_labels: "#FFFFFF",
                colors_accent_1: accentColor,
                colors_accent_2: primaryColor,
                colors_text: textColor,
                colors_background_1: backgroundColor,
                colors_background_2: backgroundColor,
                colors_primary_button: primaryColor,
                colors_primary_button_label: "#FFFFFF",
                colors_secondary_button: "transparent",
                colors_secondary_button_label: primaryColor,
                // Typography
                type_body_font: "assistant_n4",
                type_header_font: "assistant_n7",
                // Store name/branding
                logo_width: 90,
                social_twitter_link: "",
                social_facebook_link: "",
                social_pinterest_link: "",
                social_instagram_link: "",
                // Checkout branding
                checkout_banner_image: productImages[0]?.url || "",
                checkout_logo_position: "center",
                checkout_body_background_color: backgroundColor,
                checkout_accent_color: primaryColor,
                checkout_button_color: primaryColor,
              }
            })
          }
        };

        logStep("Configuring theme settings", { 
          primaryColor, 
          backgroundColor, 
          textColor,
          themeId: activeThemeId 
        });

        // Try to update theme settings (may fail if theme doesn't support it)
        try {
          const themeUpdateResponse = await fetch(
            `https://${shopifyStoreDomain}/admin/api/2024-01/themes/${activeThemeId}/assets.json`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": shopifyAccessToken,
              },
              body: JSON.stringify(themeSettings),
            }
          );

          if (themeUpdateResponse.ok) {
            logStep("Theme settings updated successfully");
            themeConfigured = true;
          } else {
            const themeError = await themeUpdateResponse.text();
            logStep("Theme settings update failed (non-critical)", { error: themeError });
            
            // Try alternative method - update individual settings via API
            // Some themes require this approach
          }
        } catch (themeErr) {
          logStep("Theme configuration error (non-critical)", { error: String(themeErr) });
        }

        // ============ STEP 4: SET STORE NAME (via Shop settings if possible) ============
        if (storeData.storeName) {
          try {
            // Note: Updating shop name requires different scopes, log for info
            logStep("Store name from template", { name: storeData.storeName });
          } catch (shopErr) {
            logStep("Shop name update skipped");
          }
        }
      }
    } else {
      logStep("Could not fetch themes", { status: themesResponse.status });
    }

    return new Response(
      JSON.stringify({
        success: true,
        productId: productResult.product?.id,
        productHandle: productResult.product?.handle,
        productUrl: `https://${shopifyStoreDomain}/products/${productResult.product?.handle}`,
        shopDomain: shopifyStoreDomain,
        themeConfigured,
        message: themeConfigured 
          ? "Produit créé et thème configuré avec succès !" 
          : "Produit créé ! Les couleurs du thème peuvent nécessiter une configuration manuelle.",
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
