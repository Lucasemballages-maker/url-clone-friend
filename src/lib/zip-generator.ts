import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { StoreData } from '@/types/store';

export interface ZipGeneratorResult {
  blob: Blob;
  filename: string;
}

// Generate standalone HTML with Shopify Buy Button SDK integration
function generateStandaloneHTML(storeData: StoreData): string {
  const primaryColor = storeData.primaryColor || "#4A90E2";
  const accentColor = storeData.accentColor || "#764ba2";
  
  const mainImage = storeData.productImages[0] || "";
  const thumbnails = storeData.productImages.slice(0, 4);
  
  const benefitsHTML = storeData.benefits.map(b => `
    <li class="benefit-item">
      <span class="benefit-check">✓</span>
      <span>${b}</span>
    </li>
  `).join('');

  const benefitCardsHTML = (storeData.benefitCards || []).slice(0, 4).map(card => `
    <div class="feature-card">
      <div class="feature-icon">${card.icon}</div>
      <div class="feature-title">${card.title}</div>
      <div class="feature-desc">${card.description || ''}</div>
    </div>
  `).join('');

  const reviewsHTML = (storeData.customerReviews || []).slice(0, 3).map(review => `
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
    <div class="product-thumbnail ${i === 0 ? 'active' : ''}" onclick="changeImage(${i})">
      <img src="./images/product-${i + 1}.jpg" alt="Thumbnail ${i + 1}" loading="lazy">
    </div>
  `).join('');

  // Generate image references for local files
  const imageRefsJS = thumbnails.map((_, i) => `"./images/product-${i + 1}.jpg"`).join(',');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${storeData.productName} - ${storeData.storeName}</title>
  <meta name="description" content="${storeData.description}">
  
  <!-- Shopify Buy Button SDK -->
  <script src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"></script>
  
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: #1f2937;
      background: #ffffff;
    }
    
    :root {
      --primary: ${primaryColor};
      --accent: ${accentColor};
      --gradient: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
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
      flex-wrap: wrap;
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

    .hero-cta-container {
      margin-top: 20px;
    }

    /* Shopify Buy Button styling override */
    .shopify-buy__btn {
      background: white !important;
      color: var(--primary) !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      padding: 14px 32px !important;
      border-radius: 9999px !important;
      border: none !important;
      cursor: pointer !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
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
      transition: border-color 0.2s;
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

    .buy-button-container {
      margin: 24px 0;
    }
    
    .buy-button-placeholder {
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
    
    .buy-button-placeholder:hover {
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
      .promo-banner-content { flex-wrap: nowrap; }
    }
  </style>
</head>
<body>
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
      <span>⭐ ${storeData.reviews || '21 883'} Avis Clients</span>
      <span>🚀 Expédition 24h</span>
      <span>✨ Livraison Gratuite</span>
      <span>🛡️ Garantie 30 Jours</span>
      <span>⭐ ${storeData.reviews || '21 883'} Avis Clients</span>
      <span>🚀 Expédition 24h</span>
    </div>
  </div>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-badge">⭐ Note ${storeData.rating || '4.8'}/5 - ${storeData.reviews || '21 883'} avis</div>
    <h1>${storeData.headline || storeData.productName}</h1>
    <div class="hero-features">
      <div class="hero-feature">✓ ${storeData.benefits[0] || 'Qualité premium'}</div>
      <div class="hero-feature">✓ ${storeData.benefits[1] || 'Livraison rapide'}</div>
      <div class="hero-feature">✓ ${storeData.benefits[2] || 'Garantie satisfaction'}</div>
    </div>
    
    <!-- Shopify Buy Button - Hero CTA -->
    <div class="hero-cta-container">
      <div id="hero-buy-button"></div>
    </div>
  </section>

  <!-- Product Section -->
  <section class="product-section">
    <div class="product-gallery">
      <img src="./images/product-1.jpg" alt="${storeData.productName}" class="product-main-image" id="mainImage">
      <div class="product-thumbnails">
        ${thumbnailsHTML}
      </div>
    </div>

    <div class="product-rating-badge">⭐ Produit noté ${storeData.rating || '4.8'}/5</div>
    
    <h2 class="product-title">${storeData.productName}</h2>
    
    <div class="product-stars">
      <span class="stars">★★★★★</span>
      <span class="reviews-count">(${storeData.reviews || '21 883'} avis vérifiés)</span>
    </div>

    <div class="product-price">
      <span class="original-price">${storeData.originalPrice || '89.99€'}</span>
      <span class="current-price">${storeData.productPrice}</span>
      <span class="promo-badge">-50%</span>
    </div>

    <ul class="benefits-list">
      ${benefitsHTML}
    </ul>

    <!-- Shopify Buy Button - Product Section -->
    <div class="buy-button-container">
      <div id="product-buy-button"></div>
    </div>

    <div class="payment-trust">
      <span>🔒 Paiement sécurisé</span>
      <span>📦 Livraison offerte</span>
      <span>↩️ Retours gratuits</span>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <h2 class="section-title">Pourquoi nous choisir ?</h2>
    <div class="features-grid">
      ${benefitCardsHTML}
    </div>
  </section>

  <!-- Reviews Section -->
  <section class="reviews-section">
    <h2 class="section-title">Ce que nos clients disent</h2>
    ${reviewsHTML}
  </section>

  <!-- Final CTA -->
  <section class="final-cta">
    <h2>${storeData.finalCtaTitle || 'Prêt à transformer votre quotidien ?'}</h2>
    <p>Rejoignez des milliers de clients satisfaits</p>
    <div id="final-buy-button"></div>
  </section>

  <!-- Footer -->
  <footer class="landing-footer">
    <p>© 2024 ${storeData.storeName}. Tous droits réservés.</p>
    <p style="margin-top: 8px;">Créé avec ❤️ par Dropyfy</p>
  </footer>

  <!-- Countdown Timer Script -->
  <script>
    // Countdown Timer
    let countdownTime = 3 * 60 * 60; // 3 hours in seconds
    
    function updateCountdown() {
      const hours = Math.floor(countdownTime / 3600);
      const minutes = Math.floor((countdownTime % 3600) / 60);
      const seconds = countdownTime % 60;
      
      document.getElementById('countdown').textContent = 
        String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');
      
      if (countdownTime > 0) {
        countdownTime--;
        setTimeout(updateCountdown, 1000);
      }
    }
    updateCountdown();

    // Image Gallery
    const productImages = [${imageRefsJS}];
    
    function changeImage(index) {
      document.getElementById('mainImage').src = productImages[index];
      document.querySelectorAll('.product-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
      });
    }
  </script>

  <!-- 
    ============================================
    SHOPIFY BUY BUTTON INTEGRATION
    ============================================
    
    INSTRUCTIONS:
    1. Remplacez PLACEHOLDER-SHOP par votre domaine Shopify (ex: ma-boutique.myshopify.com)
    2. Remplacez PLACEHOLDER-TOKEN par votre Storefront Access Token
    3. Remplacez PLACEHOLDER-PRODUCT-ID par l'ID de votre produit Shopify
    
    Pour trouver ces valeurs:
    - Domain: Visible dans l'URL de votre admin Shopify
    - Token: Admin Shopify > Apps > Développer des apps > Créer une app > Storefront API
    - Product ID: Admin Shopify > Produits > Cliquez sur un produit > L'ID est dans l'URL
    
    ============================================
  -->
  <script>
    (function () {
      var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
      
      function initShopifyBuyButton() {
        var client = ShopifyBuy.buildClient({
          domain: 'PLACEHOLDER-SHOP.myshopify.com',
          storefrontAccessToken: 'PLACEHOLDER-TOKEN'
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
          // Hero Buy Button
          ui.createComponent('product', {
            id: 'PLACEHOLDER-PRODUCT-ID',
            node: document.getElementById('hero-buy-button'),
            moneyFormat: '%E2%82%AC{{amount_with_comma_separator}}',
            options: {
              product: {
                buttonDestination: 'checkout',
                contents: {
                  img: false,
                  title: false,
                  price: false,
                  button: true
                },
                text: {
                  button: '${storeData.cta || 'Commander maintenant'}'
                },
                styles: {
                  button: {
                    'background': 'white',
                    'color': '${primaryColor}',
                    'font-size': '14px',
                    'font-weight': '700',
                    'padding': '14px 32px',
                    'border-radius': '9999px',
                    'box-shadow': '0 10px 25px rgba(0,0,0,0.2)',
                    ':hover': {
                      'background': '#f3f4f6',
                      'transform': 'translateY(-2px)'
                    }
                  }
                }
              }
            }
          });

          // Product Section Buy Button
          ui.createComponent('product', {
            id: 'PLACEHOLDER-PRODUCT-ID',
            node: document.getElementById('product-buy-button'),
            moneyFormat: '%E2%82%AC{{amount_with_comma_separator}}',
            options: {
              product: {
                buttonDestination: 'checkout',
                contents: {
                  img: false,
                  title: false,
                  price: false,
                  button: true
                },
                text: {
                  button: '${storeData.cta || 'Commander maintenant'}'
                },
                styles: {
                  button: {
                    'background': 'linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)',
                    'color': 'white',
                    'font-size': '14px',
                    'font-weight': '700',
                    'padding': '16px',
                    'border-radius': '9999px',
                    'width': '100%',
                    'box-shadow': '0 10px 25px rgba(0,0,0,0.2)',
                    ':hover': {
                      'transform': 'translateY(-2px)',
                      'box-shadow': '0 15px 35px rgba(0,0,0,0.25)'
                    }
                  }
                }
              }
            }
          });

          // Final CTA Buy Button
          ui.createComponent('product', {
            id: 'PLACEHOLDER-PRODUCT-ID',
            node: document.getElementById('final-buy-button'),
            moneyFormat: '%E2%82%AC{{amount_with_comma_separator}}',
            options: {
              product: {
                buttonDestination: 'checkout',
                contents: {
                  img: false,
                  title: false,
                  price: false,
                  button: true
                },
                text: {
                  button: '${storeData.cta || 'Commander maintenant'}'
                },
                styles: {
                  button: {
                    'background': 'white',
                    'color': '${primaryColor}',
                    'font-size': '13px',
                    'font-weight': '700',
                    'padding': '14px 32px',
                    'border-radius': '9999px',
                    'box-shadow': '0 10px 25px rgba(0,0,0,0.2)',
                    ':hover': {
                      'background': '#f3f4f6',
                      'transform': 'translateY(-2px)'
                    }
                  }
                }
              }
            }
          });
        });
      }

      if (window.ShopifyBuy) {
        if (window.ShopifyBuy.UI) {
          initShopifyBuyButton();
        } else {
          loadScript();
        }
      } else {
        loadScript();
      }

      function loadScript() {
        var script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
        script.onload = initShopifyBuyButton;
      }
    })();
  </script>
</body>
</html>`;
}

// Generate PDF instructions
function generateInstructionsPDF(): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(74, 144, 226);
  doc.text('Guide d\'intégration Shopify', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Configurez votre boutique en 4 étapes simples', pageWidth / 2, 40, { align: 'center' });
  
  let y = 60;
  
  // Step 1
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Étape 1 : Créer votre produit Shopify', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const step1Text = [
    '1. Connectez-vous à votre admin Shopify (admin.shopify.com)',
    '2. Allez dans "Produits" > "Ajouter un produit"',
    '3. Remplissez le titre, description et prix',
    '4. Uploadez les images du dossier /images/',
    '5. Cliquez sur "Enregistrer"',
    '',
    'Note: Copiez l\'ID du produit depuis l\'URL:',
    'admin.shopify.com/products/[VOTRE-ID-PRODUIT]'
  ];
  step1Text.forEach(line => {
    doc.text(line, margin, y);
    y += 6;
  });
  
  y += 10;
  
  // Step 2
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Étape 2 : Configurer le Storefront API', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const step2Text = [
    '1. Dans l\'admin, allez dans "Paramètres" > "Apps et canaux de vente"',
    '2. Cliquez sur "Développer des apps" (en bas)',
    '3. Cliquez sur "Créer une app" et donnez-lui un nom',
    '4. Dans l\'onglet "Configuration", activez "Storefront API"',
    '5. Sélectionnez les accès: "unauthenticated_read_product_listings"',
    '6. Cliquez sur "Enregistrer" puis "Installer l\'app"',
    '7. Copiez le "Storefront API access token"',
    '',
    'C\'est votre PLACEHOLDER-TOKEN'
  ];
  step2Text.forEach(line => {
    doc.text(line, margin, y);
    y += 6;
  });
  
  y += 10;
  
  // Step 3
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Étape 3 : Configurer le fichier HTML', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const step3Text = [
    '1. Ouvrez le fichier index.html avec un éditeur de texte',
    '2. Cherchez "PLACEHOLDER-SHOP" et remplacez par votre domaine',
    '   Exemple: ma-boutique.myshopify.com',
    '3. Cherchez "PLACEHOLDER-TOKEN" et remplacez par votre token',
    '4. Cherchez "PLACEHOLDER-PRODUCT-ID" et remplacez par l\'ID produit',
    '   Note: L\'ID doit être un nombre (ex: 7891234567890)',
    '5. Enregistrez le fichier'
  ];
  step3Text.forEach(line => {
    doc.text(line, margin, y);
    y += 6;
  });
  
  // New page for Step 4
  doc.addPage();
  y = 30;
  
  // Step 4
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Étape 4 : Publier sur Shopify', margin, y);
  y += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  const step4Text = [
    '1. Dans l\'admin Shopify, allez dans "Pages"',
    '2. Cliquez sur "Ajouter une page"',
    '3. Donnez un titre à votre page',
    '4. Cliquez sur l\'icône "</>" pour passer en mode HTML',
    '5. Copiez-collez tout le contenu du fichier index.html',
    '6. Cliquez sur "Enregistrer"',
    '',
    'Alternative: Hébergement externe',
    '- Uploadez le dossier complet sur votre hébergeur',
    '- Ou utilisez GitHub Pages, Netlify, Vercel...'
  ];
  step4Text.forEach(line => {
    doc.text(line, margin, y);
    y += 6;
  });
  
  y += 15;
  
  // Recap box
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'F');
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Récapitulatif des 3 valeurs à remplacer:', margin + 5, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('• PLACEHOLDER-SHOP → Votre domaine (ex: ma-boutique.myshopify.com)', margin + 5, y);
  y += 6;
  doc.text('• PLACEHOLDER-TOKEN → Votre Storefront API access token', margin + 5, y);
  y += 6;
  doc.text('• PLACEHOLDER-PRODUCT-ID → L\'ID numérique de votre produit', margin + 5, y);
  
  y += 20;
  
  // Support
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(74, 144, 226);
  doc.text('Besoin d\'aide ?', margin, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('Contactez-nous: support@dropyfy.com', margin, y);
  y += 6;
  doc.text('Documentation Shopify: help.shopify.com', margin, y);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text('Créé avec Dropyfy - dropyfy.com', pageWidth / 2, footerY, { align: 'center' });
  
  return doc.output('blob');
}

// Fetch and convert image to base64
async function fetchImageAsBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    console.error('Error fetching image:', url, error);
    return null;
  }
}

// Main function to generate the complete ZIP
export async function generateStoreZip(storeData: StoreData): Promise<ZipGeneratorResult> {
  const zip = new JSZip();
  
  // 1. Generate HTML
  const html = generateStandaloneHTML(storeData);
  zip.file('index.html', html);
  
  // 2. Create images folder and add product images
  const imagesFolder = zip.folder('images');
  
  if (storeData.productImages && storeData.productImages.length > 0) {
    const imagePromises = storeData.productImages.slice(0, 4).map(async (imageUrl, index) => {
      const blob = await fetchImageAsBlob(imageUrl);
      if (blob && imagesFolder) {
        imagesFolder.file(`product-${index + 1}.jpg`, blob);
      }
    });
    
    await Promise.all(imagePromises);
  }
  
  // 3. Generate and add PDF instructions
  const pdfBlob = generateInstructionsPDF();
  zip.file('INSTRUCTIONS.pdf', pdfBlob);
  
  // 4. Add README.txt for quick reference
  const readmeContent = `
═══════════════════════════════════════════════════
   ${storeData.storeName} - Guide Rapide
═══════════════════════════════════════════════════

Contenu du ZIP:
- index.html : Votre page de vente complète
- /images/ : Images du produit
- INSTRUCTIONS.pdf : Guide détaillé avec captures d'écran

CONFIGURATION RAPIDE:
1. Ouvrez index.html dans un éditeur de texte
2. Remplacez les 3 valeurs PLACEHOLDER:
   - PLACEHOLDER-SHOP → votre-boutique.myshopify.com
   - PLACEHOLDER-TOKEN → Votre Storefront API token
   - PLACEHOLDER-PRODUCT-ID → ID de votre produit Shopify

3. Uploadez sur Shopify (Pages) ou votre hébergeur

Support: support@dropyfy.com

Créé avec ❤️ par Dropyfy
═══════════════════════════════════════════════════
`;
  zip.file('README.txt', readmeContent);
  
  // 5. Generate the ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Generate filename
  const sanitizedName = storeData.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  const filename = `${sanitizedName}-site.zip`;
  
  return { blob, filename };
}

// Trigger download of the ZIP
export function downloadZip(result: ZipGeneratorResult): void {
  const url = URL.createObjectURL(result.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
