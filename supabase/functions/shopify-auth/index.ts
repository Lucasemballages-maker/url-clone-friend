import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SHOPIFY-AUTH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting Shopify OAuth flow");

    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
    if (!clientId) {
      throw new Error("SHOPIFY_CLIENT_ID not configured");
    }

    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    const userId = url.searchParams.get("user_id");
    
    if (!shop) {
      throw new Error("Shop parameter is required");
    }

    // Validate shop domain format
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    if (!shopRegex.test(shop)) {
      throw new Error("Invalid shop domain format");
    }

    logStep("Received params", { shop, hasUserId: !!userId });

    const redirectUri = "https://jwoofhbzypjzwjowffcr.supabase.co/functions/v1/shopify-callback";
    const scopes = "write_products,read_products,write_themes";
    
    // Include user_id in state for callback to retrieve
    const stateData = {
      nonce: crypto.randomUUID(),
      user_id: userId || null,
    };
    const state = btoa(JSON.stringify(stateData));

    const authUrl = `https://${shop}/admin/oauth/authorize?` +
      `client_id=${clientId}` +
      `&scope=${scopes}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;

    logStep("Redirecting to Shopify", { shop, hasUserId: !!userId });

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": authUrl,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
