const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch product data using Bright Data Web Scraping API
async function fetchWithBrightData(url: string): Promise<string | null> {
  const apiKey = Deno.env.get('BRIGHTDATA_API_KEY');
  
  if (!apiKey) {
    console.error('BRIGHTDATA_API_KEY not configured');
    return null;
  }

  console.log('Fetching via Bright Data POST API...');
  console.log('Target URL:', url);
  
  try {
    const response = await fetch('https://api.brightdata.com/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: 'web_unlocker',
        url: url,
        format: 'raw',
        method: 'GET',
        country: 'fr',
      }),
    });

    if (!response.ok) {
      console.error('Bright Data error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return null;
    }

    const html = await response.text();
    console.log('Bright Data response length:', html.length);
    return html;
  } catch (error) {
    console.error('Bright Data fetch error:', error);
    return null;
  }
}

// Parse product data from HTML
function parseProductData(html: string, productId: string): {
  title: string;
  description: string;
  images: string[];
  price: string;
  originalPrice: string;
  rating: string;
  reviews: string;
} {
  const images: string[] = [];
  
  console.log('=== PARSING HTML ===');
  console.log('HTML length:', html.length);

  // === PRIORITY 1: window.runParams JSON data ===
  const runParamsMatch = html.match(/window\.runParams\s*=\s*(\{[\s\S]*?\});?\s*(?:var|const|let|window|<\/script>)/);
  if (runParamsMatch) {
    try {
      // Clean the JSON string
      let jsonStr = runParamsMatch[1]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
        .replace(/:\s*'([^']*)'/g, ':"$1"');
      
      console.log('[runParams] Found, attempting parse...');
      
      // Extract imagePathList directly with regex (safer than full JSON parse)
      const imageListMatch = html.match(/"imagePathList"\s*:\s*\[([\s\S]*?)\]/);
      if (imageListMatch) {
        const urls = imageListMatch[1].match(/["']([^"']+)["']/g);
        if (urls) {
          for (const url of urls) {
            let cleanUrl = url.replace(/['"]/g, '').replace(/\\\//g, '/');
            if (cleanUrl.startsWith('//')) cleanUrl = 'https:' + cleanUrl;
            if (cleanUrl.includes('alicdn.com') || cleanUrl.includes('aliexpress.com')) {
              // Upgrade to high resolution
              cleanUrl = cleanUrl.replace(/_\d+x\d+\./gi, '_800x800.');
              if (!cleanUrl.includes('_800x800')) {
                cleanUrl = cleanUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '_800x800.$1');
              }
              if (!images.includes(cleanUrl) && images.length < 7) {
                images.push(cleanUrl);
                console.log('[runParams imagePathList]', cleanUrl);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('[runParams] Parse error:', e);
    }
  }

  // === PRIORITY 2: window.__INIT_DATA__ JSON ===
  const initDataMatch = html.match(/window\.__INIT_DATA__\s*=\s*(\{[\s\S]*?\});?\s*(?:var|const|let|window|<\/script>)/);
  if (initDataMatch && images.length < 7) {
    console.log('[__INIT_DATA__] Found, extracting images...');
    
    // Extract all image URLs from this JSON block
    const imgMatches = initDataMatch[1].match(/["'](https?:\/\/[^"'\s]+(?:alicdn|aliexpress)[^"'\s]+\.(?:jpg|jpeg|png|webp))["']/gi);
    if (imgMatches) {
      for (const match of imgMatches) {
        let cleanUrl = match.replace(/['"]/g, '').replace(/\\\//g, '/');
        cleanUrl = cleanUrl.replace(/_\d+x\d+\./gi, '_800x800.');
        if (!images.includes(cleanUrl) && images.length < 7) {
          images.push(cleanUrl);
          console.log('[__INIT_DATA__]', cleanUrl);
        }
      }
    }
  }

  // === PRIORITY 3: og:image meta tag ===
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImageMatch && images.length < 7) {
    let imgUrl = ogImageMatch[1].replace(/\\\//g, '/');
    if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
    if (imgUrl.includes('alicdn.com') || imgUrl.includes('aliexpress.com')) {
      imgUrl = imgUrl.replace(/_\d+x\d+\./gi, '_800x800.');
      if (!images.includes(imgUrl)) {
        images.unshift(imgUrl); // Add as first image
        console.log('[og:image]', imgUrl);
      }
    }
  }

  // === PRIORITY 4: All alicdn product images in HTML ===
  const allAlicdnImages = html.match(/https?:\/\/[^"'\s<>]+alicdn\.com\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/gi);
  if (allAlicdnImages && images.length < 7) {
    for (const imgUrl of allAlicdnImages) {
      // Only include product images (from /kf/ or /imgextra/ folders)
      if (imgUrl.includes('/kf/') || imgUrl.includes('/imgextra/') || imgUrl.includes('/item/')) {
        let cleanUrl = imgUrl.replace(/_\d+x\d+\./gi, '_800x800.');
        if (!images.includes(cleanUrl) && images.length < 7) {
          images.push(cleanUrl);
          console.log('[alicdn.com]', cleanUrl);
        }
      }
    }
  }

  // === Extract Title ===
  let title = '';
  const titlePatterns = [
    /"subject"\s*:\s*"([^"]+)"/i,
    /"productTitle"\s*:\s*"([^"]+)"/i,
    /"title"\s*:\s*"([^"]+)"/i,
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<title>([^<|]+)/i,
  ];
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      title = match[1].replace(/\s*[-|]\s*AliExpress.*$/i, '').trim();
      console.log('[title]', title);
      break;
    }
  }

  // === Extract Price ===
  let price = '29.99';
  const pricePatterns = [
    /"formattedPrice"\s*:\s*"([^"]+)"/i,
    /"minPrice"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i,
    /"price"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/i,
    /"discountPrice"\s*:\s*"([^"]+)"/i,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      price = match[1].replace(/[^\d.,]/g, '').replace(',', '.') || '29.99';
      console.log('[price]', price);
      break;
    }
  }

  // === Extract Rating ===
  let rating = '4.5';
  const ratingMatch = html.match(/"averageStar"\s*:\s*"?(\d+(?:\.\d+)?)"?/i) ||
                      html.match(/"rating"\s*:\s*"?(\d+(?:\.\d+)?)"?/i);
  if (ratingMatch) {
    rating = ratingMatch[1];
    console.log('[rating]', rating);
  }

  // === Extract Reviews Count ===
  let reviews = '100';
  const reviewsMatch = html.match(/"totalValidNum"\s*:\s*"?(\d+)"?/i) ||
                       html.match(/"reviewCount"\s*:\s*"?(\d+)"?/i) ||
                       html.match(/"tradeCount"\s*:\s*"?(\d+)"?/i);
  if (reviewsMatch) {
    reviews = reviewsMatch[1];
    console.log('[reviews]', reviews);
  }

  // === Extract Description ===
  let description = 'Découvrez ce produit de qualité supérieure.';
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (descMatch && descMatch[1]) {
    description = descMatch[1].slice(0, 200);
  }

  console.log('=== PARSED RESULTS ===');
  console.log('Images found:', images.length);
  console.log('Title:', title || 'Not found');
  console.log('Price:', price);
  console.log('====================');

  return {
    title: title || `Produit AliExpress #${productId}`,
    description,
    images,
    price,
    originalPrice: (parseFloat(price) * 1.6).toFixed(2),
    rating,
    reviews,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('=== SCRAPING ALIEXPRESS WITH BRIGHT DATA ===');
    console.log('URL:', formattedUrl);

    // Extract product ID from URL
    const productIdMatch = formattedUrl.match(/item\/(\d+)\.html/);
    const productId = productIdMatch ? productIdMatch[1] : null;
    console.log('Product ID:', productId);

    if (!productId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not extract product ID from URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch HTML using Bright Data
    const html = await fetchWithBrightData(formattedUrl);

    let title = 'Produit AliExpress';
    let description = 'Découvrez ce produit de qualité supérieure sur AliExpress.';
    let images: string[] = [];
    let price = '29.99';
    let originalPrice = '49.99';
    let rating = '4.5';
    let reviews = '100';

    if (html && html.length > 5000) {
      console.log('Bright Data returned valid HTML, parsing...');
      const parsed = parseProductData(html, productId);
      title = parsed.title;
      description = parsed.description;
      images = parsed.images;
      price = parsed.price;
      originalPrice = parsed.originalPrice;
      rating = parsed.rating;
      reviews = parsed.reviews;
    } else {
      console.log('Bright Data did not return valid HTML, using fallback...');
    }

    // If still no images, generate placeholder URLs (will trigger text-only AI generation)
    if (images.length === 0) {
      console.log('No images found, returning empty array (AI will generate from text)');
    }

    console.log('=== FINAL RESULTS ===');
    console.log('Title:', title);
    console.log('Images count:', images.length);
    images.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
    console.log('Price:', price);
    console.log('Rating:', rating);
    console.log('Reviews:', reviews);
    console.log('=====================');

    const productData = {
      success: true,
      data: {
        title,
        description,
        images: images.slice(0, 7),
        price,
        originalPrice,
        rating,
        reviews,
        sourceUrl: formattedUrl,
        productId,
      }
    };

    return new Response(
      JSON.stringify(productData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
