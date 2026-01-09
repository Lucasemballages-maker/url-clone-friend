const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Scraping AliExpress URL:', formattedUrl);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
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

    // Extract images from HTML
    const imageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const images: string[] = [];
    let match;
    
    while ((match = imageRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      // Filter for product images (AliExpress CDN)
      if (imgUrl.includes('alicdn.com') && !imgUrl.includes('icon') && !imgUrl.includes('flag')) {
        // Get high quality version
        const highQualityUrl = imgUrl.replace(/_\d+x\d+/, '').replace(/\.jpg_\d+x\d+/, '.jpg');
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Also look for data-src attributes (lazy loaded images)
    const dataSrcRegex = /data-src=["']([^"']+)["']/gi;
    while ((match = dataSrcRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (imgUrl.includes('alicdn.com') && !imgUrl.includes('icon') && !imgUrl.includes('flag')) {
        const highQualityUrl = imgUrl.replace(/_\d+x\d+/, '').replace(/\.jpg_\d+x\d+/, '.jpg');
        if (!images.includes(highQualityUrl)) {
          images.push(highQualityUrl);
        }
      }
    }

    // Extract price - look for common AliExpress price patterns
    const priceRegex = /(?:€|EUR|US\s*\$|\$)\s*([\d,]+(?:\.\d{2})?)/gi;
    const prices: string[] = [];
    while ((match = priceRegex.exec(markdown)) !== null) {
      prices.push(match[1].replace(',', '.'));
    }

    // Extract title from metadata or markdown
    let title = metadata.title || '';
    // Clean up AliExpress title
    title = title.replace(/\s*-\s*AliExpress.*$/i, '').trim();
    title = title.replace(/^.*?\|\s*/, '').trim();

    // Extract description from markdown (first substantial paragraph)
    const descriptionMatch = markdown.match(/(?:Description|Product Details|Features)[:\s]*\n([^\n]+(?:\n[^\n]+)*)/i);
    const description = descriptionMatch ? descriptionMatch[1].trim() : '';

    // Extract rating
    const ratingMatch = markdown.match(/(\d+(?:[.,]\d+)?)\s*(?:étoiles?|stars?|\/5)/i);
    const rating = ratingMatch ? ratingMatch[1].replace(',', '.') : '4.5';

    // Extract reviews count
    const reviewsMatch = markdown.match(/(\d+(?:\s*\d+)*)\s*(?:avis|reviews?|évaluations?|vendu|sold)/i);
    const reviews = reviewsMatch ? reviewsMatch[1].replace(/\s/g, '') : '100';

    console.log('Extracted data:', {
      title,
      imagesCount: images.length,
      pricesCount: prices.length,
      rating,
      reviews
    });

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
