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
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      
      if (response.ok) {
        html = await response.text();
        console.log('Direct fetch HTML length:', html.length);
        
        // === PRIORITY 1: Extract from window.runParams JSON ===
        const runParamsMatch = html.match(/window\.runParams\s*=\s*(\{[\s\S]*?\});\s*(?:window\.|var\s|<\/script>)/);
        if (runParamsMatch) {
          console.log('Found window.runParams');
          try {
            const jsonStr = runParamsMatch[1];
            // Extract imagePathList from runParams
            const imageListMatch = jsonStr.match(/"imagePathList"\s*:\s*\[([\s\S]*?)\]/);
            if (imageListMatch) {
              const urlMatches = imageListMatch[1].match(/"([^"]+)"/g);
              if (urlMatches) {
                for (let urlMatch of urlMatches) {
                  let imgUrl = urlMatch.replace(/"/g, '').replace(/\\\//g, '/');
                  if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
                  if (imgUrl.includes('alicdn.com')) {
                    const cleanUrl = getHighQualityUrl(imgUrl);
                    if (!images.includes(cleanUrl)) {
                      images.push(cleanUrl);
                      console.log('[runParams imagePathList]', cleanUrl);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.log('Error parsing runParams:', e);
          }
        }

        // === PRIORITY 2: Extract from window.__INIT_DATA__ ===
        const initDataMatch = html.match(/window\.__INIT_DATA__\s*=\s*(\{[\s\S]*?\});\s*(?:window\.|<\/script>)/);
        if (initDataMatch) {
          console.log('Found window.__INIT_DATA__');
          try {
            const jsonStr = initDataMatch[1];
            // Look for image URLs in the data
            const imgMatches = jsonStr.match(/https?:\/\/[^"'\s]+alicdn\.com\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi);
            if (imgMatches) {
              for (const imgUrl of imgMatches) {
                if (isLikelyProductPhoto(imgUrl)) {
                  const cleanUrl = getHighQualityUrl(imgUrl);
                  if (!images.includes(cleanUrl)) {
                    images.push(cleanUrl);
                    console.log('[__INIT_DATA__]', cleanUrl);
                  }
                }
              }
            }
          } catch (e) {
            console.log('Error parsing __INIT_DATA__:', e);
          }
        }

        // === PRIORITY 3: Extract from data JSON blocks ===
        const dataJsonPatterns = [
          /data\s*:\s*(\{[\s\S]*?"imagePathList"[\s\S]*?\})/g,
          /"data"\s*:\s*(\{[\s\S]*?"imagePathList"[\s\S]*?\})/g,
        ];
        
        for (const pattern of dataJsonPatterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            const imageListMatch = match[1].match(/"imagePathList"\s*:\s*\[([\s\S]*?)\]/);
            if (imageListMatch) {
              const urlMatches = imageListMatch[1].match(/"([^"]+)"/g);
              if (urlMatches) {
                for (let urlMatch of urlMatches) {
                  let imgUrl = urlMatch.replace(/"/g, '').replace(/\\\//g, '/');
                  if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
                  if (imgUrl.includes('alicdn.com')) {
                    const cleanUrl = getHighQualityUrl(imgUrl);
                    if (!images.includes(cleanUrl)) {
                      images.push(cleanUrl);
                      console.log('[data JSON imagePathList]', cleanUrl);
                    }
                  }
                }
              }
            }
          }
        }

        // === PRIORITY 4: Extract og:image meta tags ===
        const ogPatterns = [
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
        ];
        
        for (const pattern of ogPatterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            let imgUrl = match[1].replace(/\\\//g, '/');
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            if (imgUrl.includes('alicdn.com')) {
              const cleanUrl = getHighQualityUrl(imgUrl);
              if (!images.includes(cleanUrl)) {
                images.push(cleanUrl);
                console.log('[og:image]', cleanUrl);
              }
            }
          }
        }

        // === PRIORITY 5: Extract all alicdn product images from HTML ===
        const allAlicdnImages = html.match(/https?:\/\/(?:ae0[1-4]|cbu0[1-4])\.alicdn\.com\/kf\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi);
        if (allAlicdnImages) {
          for (const imgUrl of allAlicdnImages) {
            if (isLikelyProductPhoto(imgUrl)) {
              const cleanUrl = getHighQualityUrl(imgUrl);
              if (!images.includes(cleanUrl)) {
                images.push(cleanUrl);
                console.log('[alicdn kf]', cleanUrl);
              }
            }
          }
        }

        // === PRIORITY 6: Extract from JSON fields ===
        const jsonImagePatterns = [
          /"imageUrl"\s*:\s*"([^"]+)"/gi,
          /"imgUrl"\s*:\s*"([^"]+)"/gi,
          /"pic_url"\s*:\s*"([^"]+)"/gi,
          /"mainImageUrl"\s*:\s*"([^"]+)"/gi,
          /"productImage"\s*:\s*"([^"]+)"/gi,
        ];
        
        for (const pattern of jsonImagePatterns) {
          let match;
          while ((match = pattern.exec(html)) !== null) {
            let imgUrl = match[1].replace(/\\\//g, '/');
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            if (imgUrl.includes('alicdn.com') && isLikelyProductPhoto(imgUrl)) {
              const cleanUrl = getHighQualityUrl(imgUrl);
              if (!images.includes(cleanUrl)) {
                images.push(cleanUrl);
                console.log('[JSON field]', cleanUrl);
              }
            }
          }
        }

        // === Extract title ===
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
                                  html.match(/"title"\s*:\s*"([^"]+)"/i) ||
                                  html.match(/"productTitle"\s*:\s*"([^"]+)"/i);
          if (jsonTitleMatch) {
            title = jsonTitleMatch[1];
          }
        }

        // Extract description
        const descMatch = html.match(/"description"\s*:\s*"([^"]{20,500})"/i);
        if (descMatch) {
          description = descMatch[1].replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
    } catch (fetchError) {
      console.log('Direct fetch failed:', fetchError);
    }

    console.log('=== IMAGES EXTRACTION SUMMARY ===');
    console.log('Total images found:', images.length);
    images.slice(0, 10).forEach((url, i) => console.log(`${i + 1}. ${url}`));
    console.log('=================================');

    // NO PLACEHOLDER - return empty array if no images found
    // The frontend will handle this gracefully

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
