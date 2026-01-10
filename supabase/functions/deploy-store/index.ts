import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateSubdomain(storeName: string): string {
  // Create slug from store name
  const slug = storeName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .substring(0, 20); // Limit length
  
  // Add random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `${slug}-${randomSuffix}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Non authentifié");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Utilisateur non authentifié");
    }

    const userId = userData.user.id;

    // Parse request body
    const { storeData } = await req.json();

    if (!storeData) {
      throw new Error("Données du store manquantes");
    }

    // Generate unique subdomain
    const storeName = storeData.storeName || storeData.productName || "boutique";
    let subdomain = generateSubdomain(storeName);
    
    // Check if subdomain already exists and regenerate if needed
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabaseClient
        .from("deployed_stores")
        .select("id")
        .eq("subdomain", subdomain)
        .maybeSingle();
      
      if (!existing) break;
      
      subdomain = generateSubdomain(storeName);
      attempts++;
    }

    if (attempts >= 5) {
      throw new Error("Impossible de générer un sous-domaine unique");
    }

    // Insert into deployed_stores using service role for insert
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: insertedStore, error: insertError } = await supabaseAdmin
      .from("deployed_stores")
      .insert({
        user_id: userId,
        subdomain: subdomain,
        store_data: storeData,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Erreur lors du déploiement: ${insertError.message}`);
    }

    // Construct the store URL
    const storeUrl = `https://${subdomain}.dropyfy.io`;

    return new Response(
      JSON.stringify({
        success: true,
        storeId: insertedStore.id,
        subdomain: subdomain,
        url: storeUrl,
        message: "Boutique déployée avec succès !",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Deploy error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
