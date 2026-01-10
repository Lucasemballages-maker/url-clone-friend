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
        zone: 'web_unlocker1',
        url: url,
        format: 'raw',
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

// Normalize image URL: add https, upgrade to 800x800, remove duplicates
function normalizeImageUrl(url: string): string {
  let cleanUrl = url.replace(/['"]/g, '').replace(/\\\//g, '/').trim();
  
  // Add https if missing
  if (cleanUrl.startsWith('//')) cleanUrl = 'https:' + cleanUrl;
  
  // Remove any existing size suffix and add 800x800
  cleanUrl = cleanUrl.replace(/_\d+x\d+\./gi, '.');
  
  // Add 800x800 before extension
  if (!cleanUrl.includes('_800x800.')) {
    cleanUrl = cleanUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '_800x800.$1');
  }
  
  return cleanUrl;
}

// Get base URL without size suffix for deduplication
function getImageBaseUrl(url: string): string {
  return url.replace(/_\d+x\d+\./gi, '.').replace(/\.(jpg|jpeg|png|webp)$/i, '');
}

// Check if image is a valid product image (not icon, logo, etc.)
function isValidProductImage(url: string): boolean {
  // Must be from alicdn.com
  if (!url.includes('alicdn.com')) return false;
  
  // Must be in product image folders
  if (!url.includes('/kf/') && !url.includes('/imgextra/') && !url.includes('/item/')) return false;
  
  // Exclude small images, icons, avatars
  if (url.includes('avatar') || url.includes('icon') || url.includes('logo')) return false;
  if (url.includes('_50x50') || url.includes('_100x100') || url.includes('_200x200')) return false;
  
  return true;
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
  const imageSet = new Set<string>(); // Use Set with base URLs for deduplication
  const images: string[] = [];
  
  const addImage = (url: string) => {
    if (!isValidProductImage(url)) return false;
    
    const normalized = normalizeImageUrl(url);
    const baseUrl = getImageBaseUrl(normalized);
    
    if (!imageSet.has(baseUrl) && images.length < 10) {
      imageSet.add(baseUrl);
      images.push(normalized);
      return true;
    }
    return false;
  };
  
  console.log('=== PARSING HTML ===');
  console.log('HTML length:', html.length);

  // === PRIORITY 1: window.runParams JSON data - imagePathList ===
  const imageListMatch = html.match(/"imagePathList"\s*:\s*\[([\s\S]*?)\]/);
  if (imageListMatch) {
    console.log('[runParams] Found imagePathList');
    const urls = imageListMatch[1].match(/["']([^"']+)["']/g);
    if (urls) {
      for (const url of urls) {
        if (addImage(url)) {
          console.log('[imagePathList]', images[images.length - 1]);
        }
      }
    }
  }
  
  // === PRIORITY 2: skuImages in runParams ===
  const skuImagesMatch = html.match(/"skuImages"\s*:\s*\{([^}]+)\}/);
  if (skuImagesMatch && images.length < 10) {
    const skuUrls = skuImagesMatch[1].match(/["'](https?:\/\/[^"'\s]+alicdn[^"'\s]+\.(?:jpg|jpeg|png|webp))["']/gi);
    if (skuUrls) {
      for (const url of skuUrls) {
        if (addImage(url)) {
          console.log('[skuImages]', images[images.length - 1]);
        }
      }
    }
  }

  // === PRIORITY 3: window.__INIT_DATA__ JSON ===
  const initDataMatch = html.match(/window\.__INIT_DATA__\s*=\s*(\{[\s\S]*?\});?\s*(?:var|const|let|window|<\/script>)/);
  if (initDataMatch && images.length < 10) {
    console.log('[__INIT_DATA__] Found, extracting images...');
    const imgMatches = initDataMatch[1].match(/["'](https?:\/\/[^"'\s]+alicdn[^"'\s]+\.(?:jpg|jpeg|png|webp))["']/gi);
    if (imgMatches) {
      for (const match of imgMatches) {
        if (addImage(match)) {
          console.log('[__INIT_DATA__]', images[images.length - 1]);
        }
      }
    }
  }

  // === PRIORITY 4: og:image meta tag ===
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImageMatch && images.length < 10) {
    if (addImage(ogImageMatch[1])) {
      // Move og:image to first position if added
      const lastImg = images.pop()!;
      images.unshift(lastImg);
      console.log('[og:image]', lastImg);
    }
  }

  // === PRIORITY 5: All alicdn product images in HTML ===
  const allAlicdnImages = html.match(/https?:\/\/[^"'\s<>]+alicdn\.com\/kf\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/gi);
  if (allAlicdnImages && images.length < 10) {
    for (const imgUrl of allAlicdnImages) {
      if (addImage(imgUrl)) {
        console.log('[alicdn.com]', images[images.length - 1]);
      }
    }
  }
  
  // === PRIORITY 6: Description images ===
  const descImages = html.match(/https?:\/\/[^"'\s<>]+alicdn\.com\/imgextra\/[^"'\s<>]+\.(jpg|jpeg|png|webp)/gi);
  if (descImages && images.length < 10) {
    for (const imgUrl of descImages) {
      if (addImage(imgUrl)) {
        console.log('[imgextra]', images[images.length - 1]);
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
