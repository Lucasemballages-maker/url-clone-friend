const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract dimensions from AliExpress image URL
function extractDimensionsFromUrl(url: string): { width: number; height: number } | null {
  // Pattern: _640x640.jpg or .jpg_640x640 or similar
  const patterns = [
    /_(\d+)x(\d+)\./i,
    /\.(?:jpg|png|webp)_(\d+)x(\d+)/i,
    /-(\d+)x(\d+)\./i,
    /\/(\d+)x(\d+)\//i,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
    }
  }
  return null;
}

// Check if image is likely a product photo (not icon/badge/logo)
function isLikelyProductPhoto(url: string, relaxed: boolean = false): boolean {
  const lowerUrl = url.toLowerCase();
  
  // Skip data URIs and invalid URLs
  if (url.startsWith('data:') || !url.startsWith('http')) {
    return false;
  }
  
  // STRICT exclusion patterns for non-product images
  const excludePatterns = [
    // Icons and UI elements
    '/icon', 'icon.', '_icon', 'icon_', 'icons/',
    '/flag', 'flag.', '_flag',
    '/avatar', 'avatar.',
    '/logo', 'logo.', '_logo',
    '/badge', 'badge.', '_badge',
    '/btn', 'btn_', 'button',
    '/arrow', 'arrow.',
    '/star', 'star.', '_star',
    '/check', 'check.',
    '/close', 'close.',
    '/cart', 'cart.',
    '/heart', 'heart.',
    '/share', 'share.',
    
    // Static assets domain (logos, icons)
    's.alicdn.com',
    'assets.alicdn.com',
    'img.alicdn.com/tfs/',
    
    // Template and placeholder images
    'tps-', 'template', 'placeholder', 'loading', 'sprite',
    'default', 'empty', 'blank', 'dummy',
    
    // Seller/store images
    '/seller', 'seller.', '/shop', 'shop-logo', 'store-logo',
    '/user', 'user.', '/member',
    
    // Payment/shipping icons
    '/payment', '/shipping', '/delivery', '/return', '/warranty',
    '/visa', '/mastercard', '/paypal', '/alipay',
    
    // Social icons
    '/facebook', '/twitter', '/instagram', '/youtube', '/tiktok',
    
    // Navigation elements
    '/nav', '/menu', '/header', '/footer',
  ];
  
  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) {
      return false;
    }
  }
  
  // Check dimensions from URL - reject small images
  const dims = extractDimensionsFromUrl(url);
  const minSize = relaxed ? 100 : 200; // More relaxed size threshold
  
  if (dims) {
    if (dims.width < minSize || dims.height < minSize) {
      return false;
    }
    // Reject extremely narrow/tall images (likely banners or icons)
    const ratio = dims.width / dims.height;
    if (ratio < 0.3 || ratio > 3.5) {
      return false;
    }
  }
  
  // Valid CDN domains for product images
  const validDomains = [
    'ae01.alicdn.com',
    'ae02.alicdn.com', 
    'ae03.alicdn.com',
    'ae04.alicdn.com',
    'cbu01.alicdn.com',
    'cbu02.alicdn.com',
    'cbu03.alicdn.com',
    'cbu04.alicdn.com',
    'img.alicdn.com', // Also allow general img domain in relaxed mode
  ];
  
  const isFromValidDomain = validDomains.some(domain => url.includes(domain));
  
  // In relaxed mode, accept any alicdn.com image
  if (relaxed) {
    return url.includes('alicdn.com');
  }
  
  if (!isFromValidDomain) {
    return false;
  }
  
  // Positive signals for product images
  const productImagePatterns = [
    '/kf/',
    '/imgextra/',
    'O1CN',
    '/i1/', '/i2/', '/i3/', '/i4/',
  ];
  
  // If dimensions found and large enough, it's likely a product image
  if (dims && dims.width >= 200 && dims.height >= 200) {
    return true;
  }
  
  // Otherwise require a positive signal
  return productImagePatterns.some(p => url.includes(p));
}

// Helper to get high quality version of image (upgrade to 800x800 minimum)
function getHighQualityUrl(url: string): string {
  let cleanUrl = url
    .replace(/\\\//g, '/') // Unescape JSON slashes
    .replace(/\?.*$/, ''); // Remove query params
  
  // Upgrade small dimensions to 800x800
  cleanUrl = cleanUrl
    .replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/gi, '_800x800.$1')
    .replace(/\.(jpg|jpeg|png|webp)_\d+x\d+[^"'\s]*/gi, '.$1_800x800')
    .replace(/-\d+x\d+\.(jpg|jpeg|png|webp)/gi, '-800x800.$1');
  
  // Ensure proper extension
  if (!cleanUrl.match(/\.(jpg|jpeg|png|webp)(_|$)/i)) {
    cleanUrl = cleanUrl.replace(/\.(jpg|jpeg|png|webp)[^"'\s]*/i, '.jpg');
  }
  
  return cleanUrl;
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

    // PRIORITY: Check for OG image in metadata (most reliable on AliExpress)
    const ogImage = metadata.ogImage || metadata['og:image'];
    if (ogImage && typeof ogImage === 'string' && ogImage.includes('alicdn.com')) {
      console.log('Found OG image:', ogImage);
      const cleanOgImage = getHighQualityUrl(ogImage);
      if (!images.includes(cleanOgImage)) {
        images.push(cleanOgImage);
        allFoundUrls.push(`[og:image] ${ogImage}`);
      }
    }

    // Also check for twitter:image
    const twitterImage = metadata.twitterImage || metadata['twitter:image'];
    if (twitterImage && typeof twitterImage === 'string' && twitterImage.includes('alicdn.com')) {
      console.log('Found Twitter image:', twitterImage);
      const cleanTwitterImage = getHighQualityUrl(twitterImage);
      if (!images.includes(cleanTwitterImage)) {
        images.push(cleanTwitterImage);
        allFoundUrls.push(`[twitter:image] ${twitterImage}`);
      }
    }

    // Extract og:image from HTML meta tags
    const ogImageHtmlRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    while ((match = ogImageHtmlRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (imgUrl.includes('alicdn.com')) {
        allFoundUrls.push(`[meta og:image] ${imgUrl}`);
        const cleanUrl = getHighQualityUrl(imgUrl);
        if (!images.includes(cleanUrl)) {
          images.push(cleanUrl);
        }
      }
    }

    // Alternative og:image pattern
    const ogImageAltRegex = /<meta[^>]+content=["']([^"']+alicdn[^"']+)["'][^>]+property=["']og:image["']/gi;
    while ((match = ogImageAltRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      allFoundUrls.push(`[meta og:image alt] ${imgUrl}`);
      const cleanUrl = getHighQualityUrl(imgUrl);
      if (!images.includes(cleanUrl)) {
        images.push(cleanUrl);
      }
    }

    // Method 1: Extract from <img src="...">
    const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    while ((match = imgSrcRegex.exec(html)) !== null) {
      allFoundUrls.push(`[img src] ${match[1]}`);
      if (isLikelyProductPhoto(match[1])) {
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
      if (isLikelyProductPhoto(match[1])) {
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
          if (isLikelyProductPhoto(srcUrl)) {
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
      if (isLikelyProductPhoto(match[1])) {
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
      if (isLikelyProductPhoto(imgUrl)) {
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
          if (isLikelyProductPhoto(imgUrl)) {
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
      if (isLikelyProductPhoto(imgUrl)) {
        const highQualityUrl = getHighQualityUrl(imgUrl);
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Log all found URLs for debugging
    console.log('=== ALL FOUND IMAGE URLS ===');
    console.log('Total URLs found:', allFoundUrls.length);
    allFoundUrls.slice(0, 30).forEach((url, i) => console.log(`${i + 1}. ${url}`));
    if (allFoundUrls.length > 30) {
      console.log(`... and ${allFoundUrls.length - 30} more`);
    }
    console.log('============================');

    // If no images found with strict filter, try relaxed mode
    let finalImages = images.slice(0, 7);
    
    if (finalImages.length === 0) {
      console.log('=== NO IMAGES WITH STRICT FILTER, TRYING RELAXED MODE ===');
      
      // Re-scan with relaxed filter
      const relaxedImages: string[] = [];
      for (const urlEntry of allFoundUrls) {
        const urlMatch = urlEntry.match(/\[.*?\] (.+)/);
        if (urlMatch) {
          const imgUrl = urlMatch[1];
          if (isLikelyProductPhoto(imgUrl, true)) {
            const highQualityUrl = getHighQualityUrl(imgUrl);
            if (!relaxedImages.includes(highQualityUrl)) {
              relaxedImages.push(highQualityUrl);
            }
          }
        }
      }
      finalImages = relaxedImages.slice(0, 7);
      console.log('Relaxed mode found:', relaxedImages.length, 'images');
    }

    console.log('=== FINAL PRODUCT IMAGES (max 7) ===');
    finalImages.forEach((url, i) => console.log(`${i + 1}. ${url}`));
    console.log(`Total valid: ${images.length}, Final: ${finalImages.length}`);
    console.log('====================================');

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
        images: finalImages, // Maximum 7 high-quality product images
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
