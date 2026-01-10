// Page generator - Creates a complete HTML landing page for Shopify

export interface PageData {
  storeName: string;
  productName: string;
  productPrice: string;
  originalPrice?: string;
  headline?: string;
  description?: string;
  benefits: string[];
  benefitCards: Array<{ icon: string; title: string; desc?: string; description?: string }>;
  customerReviews: Array<{ initials: string; name: string; text: string; rating: number }>;
  cta: string;
  primaryColor: string;
  accentColor: string;
  productImages: string[];
  rating?: string;
  reviews?: string;
  shopDomain: string;
  productHandle: string;
  variantId: string;
}

export function generateLandingPageHTML(data: PageData): string {
  const primaryColor = data.primaryColor || "#4A90E2";
  const accentColor = data.accentColor || "#764ba2";
  const checkoutUrl = `https://${data.shopDomain}/cart/${data.variantId}:1`;
  const productUrl = `https://${data.shopDomain}/products/${data.productHandle}`;
  
  const mainImage = data.productImages[0] || "";
  const thumbnails = data.productImages.slice(0, 4);
  
  const benefitsHTML = data.benefits.map(b => `
    <li class="benefit-item">
      <span class="benefit-check">✓</span>
      <span>${b}</span>
    </li>
  `).join('');

  const benefitCardsHTML = data.benefitCards.slice(0, 4).map(card => `
    <div class="feature-card">
      <div class="feature-icon">${card.icon}</div>
      <div class="feature-title">${card.title}</div>
      <div class="feature-desc">${card.desc || card.description || ''}</div>
    </div>
  `).join('');

  const reviewsHTML = data.customerReviews.slice(0, 3).map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${review.initials}</div>
        <div>
          <div class="review-name">${review.name}</div>
          <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        </div>
      </div>
      <p class="review-text">"${review.text}"</p>
    </div>
  `).join('');

  const thumbnailsHTML = thumbnails.map((url, i) => `
    <div class="product-thumbnail ${i === 0 ? 'active' : ''}" onclick="changeImage('${url}')">
      <img src="${url}" alt="Thumbnail ${i + 1}" loading="lazy">
    </div>
  `).join('');

  return `
<style>
  :root {
    --primary: ${primaryColor};
    --accent: ${accentColor};
    --gradient: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
  }
  
  .landing-wrapper {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.5;
    color: #1f2937;
    max-width: 100%;
    margin: 0 auto;
  }
  
  .landing-wrapper * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .promo-banner {
    background: #dc2626;
    padding: 12px;
    text-align: center;
    color: white;
  }
  
  .promo-banner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
  }
  
  .countdown {
    background: rgba(255,255,255,0.2);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
  }

  .marquee-container {
    background: var(--gradient);
    padding: 8px 0;
    overflow: hidden;
    white-space: nowrap;
  }
  
  .marquee {
    display: inline-flex;
    gap: 32px;
    animation: marquee 20s linear infinite;
  }
  
  .marquee span {
    color: white;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .hero-section {
    background: var(--gradient);
    color: white;
    padding: 48px 24px;
    text-align: center;
  }
  
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.2);
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 11px;
    margin-bottom: 12px;
  }
  
  .hero-section h1 {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  
  .hero-features {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 20px 0;
  }
  
  .hero-feature {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
  }

  .hero-cta {
    display: inline-block;
    background: white;
    color: var(--primary);
    font-size: 14px;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    margin-top: 16px;
    text-decoration: none;
  }
  
  .hero-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  }

  .product-section {
    padding: 32px 24px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .product-gallery {
    position: relative;
    margin-bottom: 20px;
  }
  
  .product-main-image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  }
  
  .product-thumbnails {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 12px;
  }
  
  .product-thumbnail {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e5e7eb;
    cursor: pointer;
  }
  
  .product-thumbnail.active {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
  
  .product-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f3f4f6;
    padding: 6px 12px;
    border-radius: 9999px;
    font-size: 11px;
    margin-bottom: 12px;
  }
  
  .product-title {
    font-size: 22px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .product-stars {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
  }
  
  .stars { color: #fbbf24; font-size: 14px; }
  .reviews-count { font-size: 11px; color: #6b7280; }

  .product-price {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .original-price {
    color: #9ca3af;
    text-decoration: line-through;
    font-size: 16px;
  }
  
  .current-price {
    font-size: 28px;
    font-weight: 800;
    color: var(--primary);
  }
  
  .promo-badge {
    background: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 9999px;
  }

  .benefits-list {
    list-style: none;
    margin-bottom: 24px;
  }
  
  .benefit-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #4b5563;
    padding: 8px 0;
  }
  
  .benefit-check {
    color: #22c55e;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .buy-button {
    display: block;
    width: 100%;
    background: var(--gradient);
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 16px;
    border-radius: 9999px;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    text-align: center;
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .buy-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.25);
  }

  .payment-trust {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
    font-size: 11px;
    color: #6b7280;
  }

  .features-section {
    background: #f9fafb;
    padding: 32px 24px;
  }
  
  .section-title {
    text-align: center;
    font-size: 18px;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 24px;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .feature-card {
    background: white;
    padding: 20px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .feature-icon { font-size: 28px; margin-bottom: 8px; }
  .feature-title { font-size: 13px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
  .feature-desc { font-size: 11px; color: #6b7280; }

  .reviews-section {
    padding: 32px 24px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .review-card {
    background: white;
    padding: 16px;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
  }
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  
  .review-avatar {
    width: 40px;
    height: 40px;
    background: var(--gradient);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 700;
  }
  
  .review-name { font-size: 13px; font-weight: 700; color: #1f2937; }
  .review-stars { color: #fbbf24; font-size: 10px; }
  .review-text { font-size: 12px; color: #6b7280; font-style: italic; }

  .final-cta {
    background: var(--gradient);
    color: white;
    padding: 48px 24px;
    text-align: center;
  }
  
  .final-cta h2 {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  
  .final-cta p {
    font-size: 12px;
    opacity: 0.9;
    margin-bottom: 20px;
  }
  
  .final-cta a {
    display: inline-block;
    background: white;
    color: var(--primary);
    font-size: 13px;
    font-weight: 700;
    padding: 14px 32px;
    border-radius: 9999px;
    text-decoration: none;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }

  .landing-footer {
    background: #1f2937;
    color: white;
    padding: 24px;
    text-align: center;
  }
  
  .landing-footer p {
    font-size: 11px;
    opacity: 0.7;
  }

  @media (min-width: 768px) {
    .hero-section h1 { font-size: 36px; }
    .features-section { padding: 48px; }
  }
</style>

<div class="landing-wrapper">
  <!-- Promo Banner -->
  <div class="promo-banner">
    <div class="promo-banner-content">
      <span>🔥 OFFRE LIMITÉE</span>
      <span class="countdown" id="countdown">02:59:47</span>
      <span>-50% aujourd'hui seulement !</span>
    </div>
  </div>

  <!-- Marquee -->
  <div class="marquee-container">
    <div class="marquee">
      <span>✨ Livraison Gratuite</span>
      <span>🛡️ Garantie 30 Jours</span>
      <span>⭐ ${data.reviews || '21 883'} Avis Clients</span>
      <span>🚀 Expédition 24h</span>
      <span>✨ Livraison Gratuite</span>
      <span>🛡️ Garantie 30 Jours</span>
      <span>⭐ ${data.reviews || '21 883'} Avis Clients</span>
      <span>🚀 Expédition 24h</span>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-badge">⭐ Note ${data.rating || '4.8'}/5 - ${data.reviews || '21 883'} avis</div>
    <h1>${data.headline || data.productName}</h1>
    <div class="hero-features">
      <div class="hero-feature">✓ ${data.benefits[0] || 'Qualité premium'}</div>
      <div class="hero-feature">✓ ${data.benefits[1] || 'Livraison gratuite'}</div>
      <div class="hero-feature">✓ ${data.benefits[2] || 'Satisfait ou remboursé'}</div>
    </div>
    <a href="${checkoutUrl}" class="hero-cta">${data.cta}</a>
  </section>

  <!-- Product Section -->
  <section class="product-section">
    <div class="product-gallery">
      <img src="${mainImage}" alt="${data.productName}" class="product-main-image" id="mainImage">
      <div class="product-thumbnails">
        ${thumbnailsHTML}
      </div>
    </div>

    <div class="product-rating-badge">⭐ Bestseller - ${data.reviews || '21 883'} vendus</div>
    <h2 class="product-title">${data.productName}</h2>
    
    <div class="product-stars">
      <span class="stars">★★★★★</span>
      <span class="reviews-count">${data.rating || '4.8'} (${data.reviews || '21 883'} avis)</span>
    </div>

    <div class="product-price">
      ${data.originalPrice ? `<span class="original-price">${data.originalPrice}€</span>` : ''}
      <span class="current-price">${data.productPrice}€</span>
      ${data.originalPrice ? '<span class="promo-badge">-50%</span>' : ''}
    </div>

    <ul class="benefits-list">
      ${benefitsHTML}
    </ul>

    <a href="${checkoutUrl}" class="buy-button">🛒 ${data.cta}</a>

    <div class="payment-trust">
      <span>🔒 Paiement Sécurisé</span>
      <span>💳 Visa, Mastercard</span>
      <span>📦 Suivi Inclus</span>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <h2 class="section-title">Pourquoi choisir ${data.storeName} ?</h2>
    <div class="features-grid">
      ${benefitCardsHTML}
    </div>
  </section>

  <!-- Reviews Section -->
  <section class="reviews-section">
    <h2 class="section-title">Ce que disent nos clients</h2>
    ${reviewsHTML}
  </section>

  <!-- Final CTA -->
  <section class="final-cta">
    <h2>Ne ratez pas cette offre !</h2>
    <p>Stock limité - Plus que quelques unités disponibles</p>
    <a href="${checkoutUrl}">${data.cta}</a>
  </section>

  <!-- Footer -->
  <footer class="landing-footer">
    <p>© ${new Date().getFullYear()} ${data.storeName}. Tous droits réservés.</p>
  </footer>
</div>

<script>
  // Countdown timer
  function startCountdown() {
    var hours = 2, minutes = 59, seconds = 47;
    var countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    setInterval(function() {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
        if (minutes < 0) {
          minutes = 59;
          hours--;
          if (hours < 0) {
            hours = 2;
            minutes = 59;
            seconds = 47;
          }
        }
      }
      countdownEl.textContent = 
        (hours < 10 ? '0' : '') + hours + ':' + 
        (minutes < 10 ? '0' : '') + minutes + ':' + 
        (seconds < 10 ? '0' : '') + seconds;
    }, 1000);
  }
  startCountdown();

  // Image gallery
  function changeImage(url) {
    var mainImg = document.getElementById('mainImage');
    if (mainImg) mainImg.src = url;
    
    var thumbnails = document.querySelectorAll('.product-thumbnail');
    thumbnails.forEach(function(thumb) {
      var img = thumb.querySelector('img');
      if (img && img.src === url) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }
</script>
`;
}
