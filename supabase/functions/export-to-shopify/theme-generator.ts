// Theme generator - Creates a complete Shopify Liquid theme matching StorePreview design

export interface ThemeData {
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
  finalCtaTitle?: string;
}

export function generateThemeFiles(data: ThemeData) {
  const primaryColor = data.primaryColor || "#4A90E2";
  const accentColor = data.accentColor || "#764ba2";
  
  // Layout/theme.liquid - Main layout file
  const themeLiquid = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page_title }} | ${data.storeName}</title>
  {{ content_for_header }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  {{ 'base.css' | asset_url | stylesheet_tag }}
</head>
<body>
  {{ content_for_layout }}
</body>
</html>`;

  // assets/base.css - All styles
  const baseCss = `
:root {
  --primary: ${primaryColor};
  --accent: ${accentColor};
  --gradient: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  line-height: 1.5;
  color: #1f2937;
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

.header {
  background: white;
  padding: 16px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.header-cta {
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
}

.hero {
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

.hero h1 {
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

.hero-feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-cta {
  background: white;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  margin-top: 16px;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  font-size: 11px;
  opacity: 0.9;
}

.product-section {
  padding: 32px 24px;
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
  border-color: ${primaryColor};
  box-shadow: 0 0 0 2px ${primaryColor}40;
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

.stars {
  color: #fbbf24;
  font-size: 14px;
}

.reviews-count {
  font-size: 11px;
  color: #6b7280;
}

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
}

.feature-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.feature-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 11px;
  color: #6b7280;
}

.reviews-section {
  padding: 32px 24px;
}

.review-card {
  background: white;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 12px;
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

.review-name {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.review-stars {
  color: #fbbf24;
  font-size: 10px;
}

.review-text {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

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

.final-cta button {
  background: white;
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.footer {
  background: #1f2937;
  color: white;
  padding: 24px;
  text-align: center;
}

.footer p {
  font-size: 11px;
  opacity: 0.7;
}

@media (min-width: 768px) {
  .hero h1 { font-size: 36px; }
  .product-section { max-width: 600px; margin: 0 auto; }
  .features-section { padding: 48px; }
  .features-grid { max-width: 600px; margin: 0 auto; }
  .reviews-section { max-width: 600px; margin: 0 auto; }
}
`;

  // templates/product.liquid - Product page template
  const productLiquid = `
<div class="promo-banner">
  <div class="promo-banner-content">
    🔥 OFFRE FLASH -29%
    <span class="countdown" id="countdown">02:47:33</span>
  </div>
</div>

<div class="marquee-container">
  <div class="marquee">
    ${Array(8).fill(`<span>✦ ${data.storeName}</span>`).join('')}
  </div>
</div>

<header class="header">
  <span class="logo">${data.storeName}</span>
  <button class="header-cta" onclick="scrollToProduct()">Commander</button>
</header>

<section class="hero">
  <div class="hero-badge">⭐ ${data.rating || "4.8"} (${data.reviews || "21 883"}+ clients)</div>
  <h1>${data.headline || data.productName}</h1>
  <div class="hero-features">
    ${(data.benefits?.slice(0, 3) || []).map(b => `
      <div class="hero-feature">
        <div class="hero-feature-icon">✓</div>
        <span>${b}</span>
      </div>
    `).join('')}
  </div>
  <button class="hero-cta" onclick="scrollToProduct()">${data.cta || "ACHETER MAINTENANT"}</button>
  <div class="trust-badges">
    <span>✓ Essai sans risque</span>
    <span>✓ Livraison OFFERTE</span>
  </div>
</section>

<div class="marquee-container" style="background: var(--primary);">
  <div class="marquee">
    ${Array(8).fill(`<span>★ ${data.storeName} ★</span>`).join('')}
  </div>
</div>

<section class="product-section" id="product">
  <div class="product-gallery">
    {% if product.featured_image %}
      <img class="product-main-image" src="{{ product.featured_image | img_url: 'large' }}" alt="{{ product.title }}" id="main-image">
    {% else %}
      <img class="product-main-image" src="${data.productImages[0] || '/placeholder.svg'}" alt="${data.productName}" id="main-image">
    {% endif %}
    
    <div class="product-thumbnails">
      {% for image in product.images limit:4 %}
        <div class="product-thumbnail {% if forloop.first %}active{% endif %}" onclick="changeImage('{{ image | img_url: 'large' }}', this)">
          <img src="{{ image | img_url: 'compact' }}" alt="{{ product.title }}">
        </div>
      {% endfor %}
    </div>
  </div>
  
  <div class="product-rating-badge">⭐ ${data.rating || "4.8"} (${data.reviews || "21 883"}+ clients)</div>
  
  <h2 class="product-title">{{ product.title }}</h2>
  
  <div class="product-stars">
    <span class="stars">★★★★★</span>
    <span class="reviews-count">(${data.reviews || "21 883"} avis)</span>
  </div>
  
  <div class="product-price">
    {% if product.compare_at_price > product.price %}
      <span class="original-price">{{ product.compare_at_price | money }}</span>
    {% endif %}
    <span class="current-price">{{ product.price | money }}</span>
    {% if product.compare_at_price > product.price %}
      <span class="promo-badge">PROMO</span>
    {% endif %}
  </div>
  
  <ul class="benefits-list">
    ${(data.benefits?.slice(0, 4) || []).map(b => `
      <li class="benefit-item">
        <span class="benefit-check">✓</span>
        <span>${b}</span>
      </li>
    `).join('')}
  </ul>
  
  {% form 'product', product %}
    <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
    <button type="submit" class="buy-button">${data.cta || "ACHETER MAINTENANT"}</button>
  {% endform %}
  
  <div class="payment-trust">
    <span>✓ Paiement sécurisé</span>
    <span>✓ Livraison gratuite</span>
  </div>
</section>

<section class="features-section">
  <h2 class="section-title">Pourquoi choisir ce produit ?</h2>
  <div class="features-grid">
    ${(data.benefitCards || []).map(card => `
      <div class="feature-card">
        <div class="feature-icon">${card.icon}</div>
        <div class="feature-title">${card.title}</div>
        <div class="feature-desc">${card.desc || card.description || ''}</div>
      </div>
    `).join('')}
  </div>
</section>

<section class="reviews-section">
  <h2 class="section-title">Ce que disent nos clients</h2>
  ${(data.customerReviews || []).map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${review.initials}</div>
        <div>
          <div class="review-name">${review.name}</div>
          <div class="review-stars">${'★'.repeat(review.rating || 5)}</div>
        </div>
      </div>
      <p class="review-text">"${review.text}"</p>
    </div>
  `).join('')}
</section>

<section class="final-cta">
  <h2>${data.finalCtaTitle || `Prêt à découvrir ${data.productName} ?`}</h2>
  <p>Profitez de -29% aujourd'hui seulement</p>
  <button onclick="scrollToProduct()">${data.cta || "ACHETER MAINTENANT"}</button>
</section>

<footer class="footer">
  <p>© 2025 ${data.storeName}. Tous droits réservés.</p>
</footer>

<script>
function scrollToProduct() {
  document.getElementById('product').scrollIntoView({ behavior: 'smooth' });
}

function changeImage(src, el) {
  document.getElementById('main-image').src = src;
  document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// Countdown timer
let hours = 2, minutes = 47, seconds = 33;
setInterval(() => {
  if (seconds > 0) seconds--;
  else if (minutes > 0) { minutes--; seconds = 59; }
  else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
  else { hours = 2; minutes = 47; seconds = 33; }
  document.getElementById('countdown').textContent = 
    String(hours).padStart(2,'0') + ':' + 
    String(minutes).padStart(2,'0') + ':' + 
    String(seconds).padStart(2,'0');
}, 1000);
</script>
`;

  // templates/index.liquid - Homepage that redirects to product
  const indexLiquid = `
{% if collections.all.products.first %}
  <script>window.location.href = "/products/{{ collections.all.products.first.handle }}";</script>
{% else %}
${productLiquid}
{% endif %}
`;

  // config/settings_schema.json
  const settingsSchema = JSON.stringify([
    {
      name: "theme_info",
      theme_name: data.storeName,
      theme_version: "1.0.0",
      theme_author: "Generated by App",
      theme_documentation_url: "",
      theme_support_url: ""
    },
    {
      name: "Colors",
      settings: [
        {
          type: "color",
          id: "primary_color",
          label: "Primary Color",
          default: primaryColor
        },
        {
          type: "color",
          id: "accent_color",
          label: "Accent Color",
          default: accentColor
        }
      ]
    }
  ]);

  // config/settings_data.json
  const settingsData = JSON.stringify({
    current: {
      primary_color: primaryColor,
      accent_color: accentColor
    }
  });

  return {
    "layout/theme.liquid": themeLiquid,
    "assets/base.css": baseCss,
    "templates/product.liquid": productLiquid,
    "templates/index.liquid": indexLiquid,
    "config/settings_schema.json": settingsSchema,
    "config/settings_data.json": settingsData
  };
}
