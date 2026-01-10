import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { store_id } = await req.json();

    if (!store_id) {
      throw new Error("store_id is required");
    }

    // Create Supabase client with service role to read store data
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch store data
    const { data: store, error: storeError } = await supabaseClient
      .from("deployed_stores")
      .select("*")
      .eq("id", store_id)
      .eq("status", "active")
      .single();

    if (storeError || !store) {
      throw new Error("Store not found or inactive");
    }

    // Check if store has Stripe API key configured
    if (!store.stripe_api_key) {
      // Fallback to payment_url if no Stripe key
      if (store.payment_url) {
        return new Response(JSON.stringify({ 
          redirect_url: store.payment_url,
          type: "external_link" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw new Error("Payment not configured for this store");
    }

    const storeData = store.store_data;
    const productName = storeData.productName || "Produit";
    const productPrice = storeData.productPrice || "49.90";
    
    // Parse price - remove € and convert to cents
    const priceString = productPrice.replace(/[€,\s]/g, '').replace(',', '.');
    const priceInCents = Math.round(parseFloat(priceString) * 100);

    if (isNaN(priceInCents) || priceInCents <= 0) {
      throw new Error("Invalid product price");
    }

    // Initialize Stripe with the STORE OWNER's API key
    const stripe = new Stripe(store.stripe_api_key, {
      apiVersion: "2025-08-27.basil",
    });

    // Get origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://dropyfy.app";

    // Create checkout session dynamically
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description: storeData.description || undefined,
              images: storeData.productImages?.slice(0, 1) || undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/store/${store.subdomain}/success`,
      cancel_url: `${origin}/store/${store.subdomain}`,
      metadata: {
        store_id: store.id,
        subdomain: store.subdomain,
      },
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      type: "stripe_checkout"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
