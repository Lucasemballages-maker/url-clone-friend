const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check if an image URL is accessible
async function isImageAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, productName, style } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const productDescription = productName || 'premium product';
    console.log('Product name:', productDescription);
    console.log('Style:', style);
    console.log('Image URL provided:', imageUrl || 'none');

    // Check if we have a valid image URL
    let hasValidImage = false;
    if (imageUrl && imageUrl.startsWith('http')) {
      console.log('Checking if image URL is accessible...');
      hasValidImage = await isImageAccessible(imageUrl);
      console.log('Image accessible:', hasValidImage);
    }

    // Style prompts for TEXT-ONLY generation (no source image)
    // Use generic product descriptions to avoid brand-related refusals
    const genericProductName = productDescription
      .replace(/DJI|Sony|Apple|Samsung|Nike|Adidas|LG|Bose|Canon|Nikon|GoPro|Dyson|Philips|Xiaomi/gi, '')
      .replace(/™|®|©/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'premium electronic device';
    
    const textOnlyStylePrompts: Record<string, string> = {
      lifestyle: `Generate a photorealistic product image: A sleek, modern ${genericProductName} displayed in an elegant home interior setting. 
        Professional e-commerce photography style with warm ambient lighting.
        Clean composition, premium aesthetic, high-end lifestyle brand feel.
        4K quality, no text or logos.`,
      studio: `Generate a photorealistic product image: A ${genericProductName} on a clean white gradient background.
        Professional studio lighting with soft shadows and subtle reflections.
        Clean, minimalist, premium product photography for e-commerce.
        4K quality, no text or logos.`,
      outdoor: `Generate a photorealistic product image: A ${genericProductName} in a beautiful natural outdoor setting.
        Soft golden hour lighting, aspirational lifestyle photography feel.
        Professional quality for premium brand marketing.
        4K quality, no text or logos.`,
      minimal: `Generate a photorealistic product image: A ${genericProductName} on a minimal background with soft shadows.
        Modern, elegant, Scandinavian-inspired minimalist aesthetic.
        Apple-style product showcase photography.
        4K quality, no text or logos.`,
    };

    // Style prompts for IMAGE EDITING (when we have a valid source image)
    // IMPORTANT: The product must remain EXACTLY as in the source - only change the background/environment
    const imageEditStylePrompts: Record<string, string> = {
      lifestyle: `CRITICAL: Do NOT modify, alter, or change the product in ANY way. Keep the EXACT same product with all its details, colors, and features.
ONLY change the background: Place this exact product in an elegant modern home setting (living room, bathroom, or kitchen) with warm inviting lighting. Professional lifestyle e-commerce photo.`,
      studio: `CRITICAL: Do NOT modify, alter, or change the product in ANY way. Keep the EXACT same product with all its details, colors, and features.
ONLY change the background: Place this exact product on a clean white or soft gradient background with professional studio lighting and subtle shadows. Premium studio product photo.`,
      outdoor: `CRITICAL: Do NOT modify, alter, or change the product in ANY way. Keep the EXACT same product with all its details, colors, and features.
ONLY change the background: Place this exact product in a beautiful natural outdoor setting with soft natural lighting. Professional outdoor product photo.`,
      minimal: `CRITICAL: Do NOT modify, alter, or change the product in ANY way. Keep the EXACT same product with all its details, colors, and features.
ONLY change the background: Place this exact product on a clean minimal background with soft shadows, modern Scandinavian-inspired aesthetic.`,
    };

    let response;

    if (hasValidImage) {
      // Use image editing mode with the source image
      console.log('Using image editing mode with source image');
      const prompt = imageEditStylePrompts[style] || imageEditStylePrompts.lifestyle;
      
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are a professional product photographer. Your task is to change ONLY the background/environment of this product image. 
The product itself must remain COMPLETELY UNCHANGED - same shape, colors, details, and features.
${prompt}`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                  },
                },
              ],
            },
          ],
          modalities: ['image', 'text'],
        }),
      });
    } else {
      // Generate image from text only (no source image available)
      console.log('Using text-only generation mode (no valid source image)');
      console.log('Generic product name:', genericProductName);
      const prompt = textOnlyStylePrompts[style] || textOnlyStylePrompts.lifestyle;
      
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: `You are a professional product photographer. Generate a beautiful product image based on this description. Output ONLY the image, no text explanation needed.\n\n${prompt}`,
            },
          ],
          modalities: ['image', 'text'],
        }),
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Please add credits to continue using AI features' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the generated image from the response
    let generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // Also check for inline_data format (base64)
    if (!generatedImageUrl) {
      const inlineData = data.choices?.[0]?.message?.images?.[0]?.inline_data;
      if (inlineData?.data && inlineData?.mime_type) {
        generatedImageUrl = `data:${inlineData.mime_type};base64,${inlineData.data}`;
      }
    }

    if (!generatedImageUrl) {
      const textContent = data.choices?.[0]?.message?.content;
      if (textContent && typeof textContent === 'string') {
        console.error('Model refused to generate image:', textContent);
        return new Response(
          JSON.stringify({ success: false, error: 'Could not generate image for this product.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('No image in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ success: false, error: 'No image generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageUrl: generatedImageUrl,
          style,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
