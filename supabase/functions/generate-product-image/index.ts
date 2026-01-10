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
    const textOnlyStylePrompts: Record<string, string> = {
      lifestyle: `Create a professional lifestyle product photograph of a "${productDescription}". 
        Place the product in an elegant, modern home setting (living room, bathroom, or kitchen).
        Use warm, inviting lighting with soft shadows. Premium aesthetic.
        The image should look like a high-end e-commerce product photo.
        Photorealistic, professional product photography, 4K quality.`,
      studio: `Create a professional studio product photograph of a "${productDescription}".
        Place the product on a clean white or soft gradient background.
        Use professional studio lighting with subtle shadows and reflections.
        Premium, clean, minimalist aesthetic.
        The image should look like a high-end Amazon or Shopify product listing.
        Photorealistic, professional product photography, 4K quality.`,
      outdoor: `Create a professional outdoor product photograph of a "${productDescription}".
        Place the product in a beautiful natural setting with soft natural lighting.
        Aspirational and appealing outdoor environment.
        The image should look like a lifestyle brand advertisement.
        Photorealistic, professional product photography, 4K quality.`,
      minimal: `Create a minimalist product photograph of a "${productDescription}".
        Use a clean, simple background with soft shadows.
        Modern, elegant, Scandinavian-inspired aesthetic.
        The image should look like an Apple-style product showcase.
        Photorealistic, professional product photography, 4K quality.`,
    };

    // Style prompts for IMAGE EDITING (when we have a valid source image)
    const imageEditStylePrompts: Record<string, string> = {
      lifestyle: `Keep the EXACT product from the source image. Transform ONLY the background and lighting. Create a professional lifestyle photo with the product placed in an elegant modern setting. Use warm, inviting lighting. Premium aesthetic.`,
      studio: `Keep the EXACT product from the source image. Transform ONLY the background. Create a professional studio product photo on a clean white or soft gradient background with professional studio lighting and subtle shadows.`,
      outdoor: `Keep the EXACT product from the source image. Transform ONLY the background. Create a professional outdoor product photo with the product in a beautiful natural setting with soft natural lighting.`,
      minimal: `Keep the EXACT product from the source image. Transform ONLY the background. Create a minimalist product photo with clean simple background, soft shadows, modern elegant style.`,
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
                  text: `You are a professional product photographer. ${prompt} Generate a new image.`,
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
              content: prompt,
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
