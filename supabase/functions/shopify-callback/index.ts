import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SHOPIFY-CALLBACK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing Shopify OAuth callback");

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const shop = url.searchParams.get("shop");
    const state = url.searchParams.get("state");

    if (!code || !shop) {
      throw new Error("Missing code or shop parameter");
    }

    logStep("Received OAuth callback", { shop, hasCode: !!code });

    const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
    const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Shopify credentials not configured");
    }

    logStep("Exchanging code for access token", { 
      shop, 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      codeLength: code.length 
    });

    // Exchange code for access token using application/x-www-form-urlencoded
    const tokenBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    });

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenBody.toString(),
    });

    const responseText = await tokenResponse.text();
    logStep("Token response received", { status: tokenResponse.status, bodyLength: responseText.length });

    if (!tokenResponse.ok) {
      logStep("Token exchange failed", { status: tokenResponse.status, error: responseText });
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (e) {
      logStep("Failed to parse token response", { error: e, responseText });
      throw new Error("Invalid response from Shopify");
    }

    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope;

    if (!accessToken) {
      logStep("No access token in response", { tokenData });
      throw new Error("No access token received from Shopify");
    }

    logStep("Token exchange successful", { scopes });

    // Store in Supabase using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user_id from state parameter
    let userId: string | null = null;
    
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        userId = stateData.user_id || null;
        logStep("Extracted user from state", { userId: userId ? "found" : "not found" });
      } catch (e) {
        logStep("Failed to parse state", { error: e });
      }
    }

    if (!userId) {
      // Redirect to app with temp token for manual linking
      const appRedirectUrl = `https://url-clone-friend.lovable.app/dashboard?shopify_connected=true&shop=${encodeURIComponent(shop)}&temp_token=${encodeURIComponent(accessToken)}`;
      
      logStep("Redirecting to app for user linking (no user_id in state)", { shop });
      
      return new Response(null, {
        status: 302,
        headers: {
          "Location": appRedirectUrl,
        },
      });
    }

    // Upsert connection
    const { error: upsertError } = await supabase
      .from("shopify_connections")
      .upsert({
        user_id: userId,
        shop_domain: shop,
        access_token: accessToken,
        scopes: scopes,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,shop_domain",
      });

    if (upsertError) {
      logStep("Failed to store connection", { error: upsertError });
      throw new Error(`Failed to store connection: ${upsertError.message}`);
    }

    logStep("Connection stored successfully");

    // Redirect back to app - go to Shopify App page
    const appRedirectUrl = `https://url-clone-friend.lovable.app/dashboard/shopify?shopify_connected=true&shop=${encodeURIComponent(shop)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": appRedirectUrl,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // Redirect to app with error
    const errorRedirectUrl = `https://url-clone-friend.lovable.app/dashboard?shopify_error=${encodeURIComponent(errorMessage)}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        "Location": errorRedirectUrl,
      },
    });
  }
});
