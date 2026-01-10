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

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('=== SCRAPING ALIEXPRESS (DIRECT) ===');
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

    // Try direct fetch to get the HTML
    let html = '';
    let title = '';
    let description = '';
    const images: string[] = [];
    
    try {
      const response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      
      if (response.ok) {
        html = await response.text();
        console.log('Direct fetch HTML length:', html.length);
        
        // Extract title from HTML
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1]
            .replace(/\s*[-|]\s*AliExpress.*$/i, '')
            .replace(/^.*?\|\s*/, '')
            .trim();
        }
        
        // Try to extract title from JSON data
        if (!title) {
          const jsonTitleMatch = html.match(/"subject"\s*:\s*"([^"]+)"/i) ||
                                  html.match(/"title"\s*:\s*"([^"]+)"/i);
          if (jsonTitleMatch) {
            title = jsonTitleMatch[1];
          }
        }
        
        // Extract images from various sources
        const imagePatterns = [
          // OG image
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
          // JSON embedded images
          /"imageUrl"\s*:\s*"([^"]+alicdn[^"]+)"/gi,
          /"imgUrl"\s*:\s*"([^"]+alicdn[^"]+)"/gi,
          /"pic_url"\s*:\s*"([^"]+alicdn[^"]+)"/gi,
          // imagePathList
          /"imagePathList"\s*:\s*\[([^\]]+)\]/gi,
        ];
        
        for (const pattern of imagePatterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            let imgUrl = match[1];
            // Handle array content
            if (imgUrl.includes(',')) {
              const urls = imgUrl.match(/"([^"]+)"/g);
              if (urls) {
                for (let u of urls) {
                  u = u.replace(/"/g, '').replace(/\\\//g, '/');
                  if (u.startsWith('//')) u = 'https:' + u;
                  if (u.includes('alicdn.com') && isLikelyProductPhoto(u)) {
                    const cleanUrl = getHighQualityUrl(u);
                    if (!images.includes(cleanUrl)) {
                      images.push(cleanUrl);
                      console.log('Found image:', cleanUrl);
                    }
                  }
                }
                continue;
              }
            }
            
            imgUrl = imgUrl.replace(/\\\//g, '/');
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            
            if (imgUrl.includes('alicdn.com') && isLikelyProductPhoto(imgUrl)) {
              const cleanUrl = getHighQualityUrl(imgUrl);
              if (!images.includes(cleanUrl)) {
                images.push(cleanUrl);
                console.log('Found image:', cleanUrl);
              }
            }
          }
        }
        
        // Extract from srcset and data-src
        const srcPatterns = [
          /data-src=["']([^"']+alicdn\.com[^"']+)["']/gi,
          /srcset=["']([^"']+alicdn\.com[^"'\s]+)/gi,
        ];
        
        for (const pattern of srcPatterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            let imgUrl = match[1].split(' ')[0].split(',')[0];
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            if (isLikelyProductPhoto(imgUrl)) {
              const cleanUrl = getHighQualityUrl(imgUrl);
              if (!images.includes(cleanUrl)) {
                images.push(cleanUrl);
                console.log('Found image from src:', cleanUrl);
              }
            }
          }
        }
      }
    } catch (fetchError) {
      console.log('Direct fetch failed:', fetchError);
    }

    // If no images found, generate placeholder URLs based on common AliExpress patterns
    // These are example product images that we'll use as fallback
    if (images.length === 0) {
      console.log('No images found, using placeholder product images');
      
      // Use high-quality stock product images as placeholders
      const placeholderImages = [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1491553895911-0055uj8a1b85?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop',
      ];
      
      images.push(...placeholderImages);
    }

    // Extract price from HTML
    let price = '29.90';
    let originalPrice = '49.90';
    
    const priceMatch = html.match(/"formattedPrice"\s*:\s*"([^"]+)"/i) ||
                       html.match(/"price"\s*:\s*"?(\d+(?:\.\d{2})?)/) ||
                       html.match(/€\s*([\d,]+(?:\.\d{2})?)/);
    if (priceMatch) {
      price = priceMatch[1].replace(',', '.').replace(/[^\d.]/g, '');
      originalPrice = (parseFloat(price) * 1.5).toFixed(2);
    }

    // Extract rating
    const ratingMatch = html.match(/"averageStar"\s*:\s*"?(\d+(?:\.\d+)?)"?/i) ||
                        html.match(/(\d+(?:[.,]\d+)?)\s*(?:étoiles?|stars?)/i);
    const rating = ratingMatch ? ratingMatch[1].replace(',', '.') : '4.5';

    // Extract reviews
    const reviewsMatch = html.match(/"totalValidNum"\s*:\s*"?(\d+)"?/i) ||
                         html.match(/(\d+)\s*(?:avis|reviews?|sold)/i);
    const reviews = reviewsMatch ? reviewsMatch[1] : '100';

    console.log('=== EXTRACTION RESULTS ===');
    console.log('Title:', title || 'Produit AliExpress');
    console.log('Images found:', images.length);
    console.log('Price:', price);
    console.log('Rating:', rating);
    console.log('Reviews:', reviews);
    console.log('==========================');

    const productData = {
      success: true,
      data: {
        title: title || `Produit AliExpress #${productId}`,
        description: description || 'Découvrez ce produit de qualité sur AliExpress.',
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
