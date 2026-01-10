const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to check if URL is a valid product image
function isValidProductImage(url: string): boolean {
  // Exclude logos, icons, flags, avatars, and small UI elements
  const excludePatterns = [
    '/icon', 'icon.', '_icon',
    '/flag', 'flag.',
    '/avatar', 'avatar.',
    '/logo', 'logo.',
    '/s.alicdn.com',  // This is for static assets, not product images
    'tps-', // Template images
    '/O1CN01', // Often used for UI elements with small dimensions
    'placeholder',
    'loading',
    'sprite',
    'btn_',
    'button',
  ];
  
  const lowerUrl = url.toLowerCase();
  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern.toLowerCase())) {
      return false;
    }
  }
  
  // Must be from AliExpress product CDN domains
  const validDomains = [
    'ae01.alicdn.com',
    'ae02.alicdn.com', 
    'ae03.alicdn.com',
    'ae04.alicdn.com',
    'cbu01.alicdn.com',
    'cbu02.alicdn.com',
    'cbu03.alicdn.com',
    'cbu04.alicdn.com',
  ];
  
  return validDomains.some(domain => url.includes(domain));
}

// Helper to get high quality version of image
function getHighQualityUrl(url: string): string {
  return url
    .replace(/_\d+x\d+\.[a-z]+/gi, '.jpg')
    .replace(/\.jpg_\d+x\d+.*$/i, '.jpg')
    .replace(/\.png_\d+x\d+.*$/i, '.png')
    .replace(/\.webp_\d+x\d+.*$/i, '.webp')
    .replace(/_\d+x\d+_/g, '_')
    .replace(/\?.*$/, ''); // Remove query params
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

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('=== SCRAPING ALIEXPRESS ===');
    console.log('URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: false, // Get full page to find all images
        waitFor: 5000, // Wait longer for images to load
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract product data from the scraped content
    const html = data.data?.html || data.html || '';
    const markdown = data.data?.markdown || data.markdown || '';
    const metadata = data.data?.metadata || data.metadata || {};
    const links = data.data?.links || data.links || [];

    console.log('HTML length:', html.length);
    console.log('Markdown length:', markdown.length);
    console.log('Links count:', links.length);

    const images: string[] = [];
    const allFoundUrls: string[] = [];
    let match;

    // Method 1: Extract from <img src="...">
    const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    while ((match = imgSrcRegex.exec(html)) !== null) {
      allFoundUrls.push(`[img src] ${match[1]}`);
      if (isValidProductImage(match[1])) {
        const highQualityUrl = getHighQualityUrl(match[1]);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Method 2: Extract from data-src (lazy loaded)
    const dataSrcRegex = /data-src=["']([^"']+alicdn\.com[^"']+)["']/gi;
    while ((match = dataSrcRegex.exec(html)) !== null) {
      allFoundUrls.push(`[data-src] ${match[1]}`);
      if (isValidProductImage(match[1])) {
        const highQualityUrl = getHighQualityUrl(match[1]);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Method 3: Extract from srcset
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;
    while ((match = srcsetRegex.exec(html)) !== null) {
      const srcsetValue = match[1];
      const srcsetUrls = srcsetValue.split(',').map(s => s.trim().split(' ')[0]);
      for (const srcUrl of srcsetUrls) {
        if (srcUrl.includes('alicdn.com')) {
          allFoundUrls.push(`[srcset] ${srcUrl}`);
          if (isValidProductImage(srcUrl)) {
            const highQualityUrl = getHighQualityUrl(srcUrl);
            if (!images.includes(highQualityUrl)) {
              images.push(highQualityUrl);
            }
          }
        }
      }
    }

    // Method 4: Extract from background-image in style
    const bgImageRegex = /background(?:-image)?:\s*url\(['"]?([^'")\s]+alicdn\.com[^'")\s]+)['"]?\)/gi;
    while ((match = bgImageRegex.exec(html)) !== null) {
      allFoundUrls.push(`[bg-image] ${match[1]}`);
      if (isValidProductImage(match[1])) {
        const highQualityUrl = getHighQualityUrl(match[1]);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Method 5: Extract from JSON data in scripts (AliExpress often embeds image data)
    const jsonImageRegex = /"(?:imageUrl|imgUrl|imagePathList|image_path|pic_url|mainImage|productImage)":\s*"([^"]+alicdn\.com[^"]+)"/gi;
    while ((match = jsonImageRegex.exec(html)) !== null) {
      const imgUrl = match[1].replace(/\\\//g, '/');
      allFoundUrls.push(`[json] ${imgUrl}`);
      if (isValidProductImage(imgUrl)) {
        const highQualityUrl = getHighQualityUrl(imgUrl);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Method 6: Extract image arrays from JSON
    const jsonArrayRegex = /"(?:imagePathList|images|galleryImages)":\s*\[([^\]]+)\]/gi;
    while ((match = jsonArrayRegex.exec(html)) !== null) {
      const arrayContent = match[1];
      const urlMatches = arrayContent.match(/"([^"]+alicdn\.com[^"]+)"/g);
      if (urlMatches) {
        for (const urlMatch of urlMatches) {
          const imgUrl = urlMatch.replace(/"/g, '').replace(/\\\//g, '/');
          allFoundUrls.push(`[json-array] ${imgUrl}`);
          if (isValidProductImage(imgUrl)) {
            const highQualityUrl = getHighQualityUrl(imgUrl);
            if (!images.includes(highQualityUrl)) {
              images.push(highQualityUrl);
            }
          }
        }
      }
    }

    // Method 7: Generic alicdn URL extraction as fallback
    const genericAlicdnRegex = /https?:\/\/(?:ae0[1-4]|cbu0[1-4])\.alicdn\.com\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi;
    while ((match = genericAlicdnRegex.exec(html)) !== null) {
      const imgUrl = match[0];
      allFoundUrls.push(`[generic] ${imgUrl}`);
      if (isValidProductImage(imgUrl)) {
        const highQualityUrl = getHighQualityUrl(imgUrl);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Log all found URLs for debugging
    console.log('=== ALL FOUND IMAGE URLS ===');
    allFoundUrls.forEach((url, i) => console.log(`${i + 1}. ${url}`));
    console.log('============================');

    console.log('=== VALID PRODUCT IMAGES ===');
    images.forEach((url, i) => console.log(`${i + 1}. ${url}`));
    console.log('============================');

    // Extract price - look for common AliExpress price patterns
    const priceRegex = /(?:€|EUR|US\s*\$|\$)\s*([\d,]+(?:\.\d{2})?)/gi;
    const prices: string[] = [];
    while ((match = priceRegex.exec(markdown)) !== null) {
      prices.push(match[1].replace(',', '.'));
    }

    // Also try to find prices in JSON data
    const jsonPriceRegex = /"(?:price|formattedPrice|activityPrice|salePrice)":\s*"?([0-9]+(?:\.[0-9]{1,2})?)"?/gi;
    while ((match = jsonPriceRegex.exec(html)) !== null) {
      if (!prices.includes(match[1])) {
        prices.push(match[1]);
      }
    }

    // Extract title from metadata or markdown
    let title = metadata.title || '';
    // Clean up AliExpress title
    title = title.replace(/\s*-\s*AliExpress.*$/i, '').trim();
    title = title.replace(/^.*?\|\s*/, '').trim();

    // Try to get title from JSON if empty
    if (!title) {
      const titleMatch = html.match(/"(?:subject|title|productTitle)":\s*"([^"]+)"/i);
      if (titleMatch) {
        title = titleMatch[1];
      }
    }

    // Extract description from markdown (first substantial paragraph)
    const descriptionMatch = markdown.match(/(?:Description|Product Details|Features|Specifications)[:\s]*\n([^\n]+(?:\n[^\n]+)*)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    // Extract rating
    const ratingMatch = markdown.match(/(\d+(?:[.,]\d+)?)\s*(?:étoiles?|stars?|\/5)/i) || 
                        html.match(/"(?:averageStar|rating)":\s*"?(\d+(?:\.\d+)?)"?/i);
    const rating = ratingMatch ? ratingMatch[1].replace(',', '.') : '4.5';

    // Extract reviews count
    const reviewsMatch = markdown.match(/(\d+(?:\s*\d+)*)\s*(?:avis|reviews?|évaluations?|vendu|sold)/i) ||
                         html.match(/"(?:totalValidNum|reviewCount|tradeCount)":\s*"?(\d+)"?/i);
    const reviews = reviewsMatch ? reviewsMatch[1].replace(/\s/g, '') : '100';

    console.log('=== EXTRACTED DATA SUMMARY ===');
    console.log('Title:', title);
    console.log('Images count:', images.length);
    console.log('Prices found:', prices);
    console.log('Rating:', rating);
    console.log('Reviews:', reviews);
    console.log('==============================');

    const productData = {
      success: true,
      data: {
        title: title || 'Produit AliExpress',
        description,
        images: images.slice(0, 10), // Limit to 10 images
        price: prices[0] || '29.90',
        originalPrice: prices[1] || prices[0] ? (parseFloat(prices[0] || '29.90') * 1.5).toFixed(2) : '49.90',
        rating,
        reviews,
        sourceUrl: formattedUrl,
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
