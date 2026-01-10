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

    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logStep("Token exchange failed", { status: tokenResponse.status, error: errorText });
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope;

    logStep("Token exchange successful", { scopes });

    // Store in Supabase using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if present, otherwise use a default user ID for now
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData.user?.id || null;
    }

    // For OAuth flow, we need to handle the case where user isn't authenticated in the callback
    // We'll store with a placeholder and update later, or use a query param
    const userIdParam = url.searchParams.get("user_id");
    const finalUserId = userId || userIdParam;

    if (!finalUserId) {
      // Redirect to app with success but need to link account
      const appRedirectUrl = `https://url-clone-friend.lovable.app/dashboard?shopify_connected=true&shop=${encodeURIComponent(shop)}&temp_token=${encodeURIComponent(accessToken)}`;
      
      logStep("Redirecting to app for user linking", { shop });
      
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
        user_id: finalUserId,
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

    // Redirect back to app
    const appRedirectUrl = `https://url-clone-friend.lovable.app/dashboard?shopify_connected=true&shop=${encodeURIComponent(shop)}`;
    
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
