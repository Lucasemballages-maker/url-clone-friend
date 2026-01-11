import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan configuration with Stripe price IDs
// Starter plan uses a coupon for the first month promo (9€ first month, then 29€/month)
const PLANS = {
  starter: {
    monthly: "price_1SnljfRwdkDlimtDqq5aJY0N",
    yearly: "price_1SnljfRwdkDlimtDqq5aJY0N",
    promoMonthly: true, // Flag to apply first month discount
  },
  pro: {
    monthly: "price_1Snlk9RwdkDlimtDekiakUgC",
    yearly: "price_1Snlk9RwdkDlimtDekiakUgC",
  },
  business: {
    monthly: "price_1SnlkURwdkDlimtDAlq06SmU",
    yearly: "price_1SnlkURwdkDlimtDAlq06SmU",
  },
  dropyfy_pro: {
    monthly: "price_1Snlk9RwdkDlimtDekiakUgC",
    yearly: "price_1Snlk9RwdkDlimtDekiakUgC",
  },
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const { planId, isYearly } = await req.json();
    logStep("Request params", { planId, isYearly });

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Get price ID based on plan and billing period
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) throw new Error(`Invalid plan: ${planId}`);
    const priceId = isYearly ? plan.yearly : plan.monthly;
    const applyPromo = !isYearly && 'promoMonthly' in plan && plan.promoMonthly;
    logStep("Selected price", { planId, isYearly, priceId, applyPromo });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Build checkout session options
    const sessionOptions: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/dashboard`,
    };

    // Apply first month promo for Starter plan (9€ first month, then 29€/month)
    // This uses Stripe's coupon: 20€ off for the first month
    if (applyPromo) {
      sessionOptions.discounts = [
        {
          coupon: "Dmvgmd0o", // STARTER_FIRST_MONTH_PROMO coupon (20€ off, once)
        },
      ];
      logStep("Applied first month promo coupon");
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
