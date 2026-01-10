const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, language = 'fr' } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Tu es un expert en copywriting e-commerce. Tu dois reformuler les textes produits pour les rendre plus attractifs et optimisés pour la conversion.

Règles:
- Utilise un ton professionnel mais accessible
- Mets en avant les bénéfices, pas juste les caractéristiques
- Crée un sentiment d'urgence subtil
- Utilise des mots puissants et émotionnels
- Garde le texte concis et percutant
- Génère DEUX sets d'avis clients différents: un pour la page d'accueil (plus généraux sur la marque/service) et un pour la page produit (spécifiques au produit)
- Les avis doivent être réalistes, crédibles et variés (pas tous 5 étoiles, mettre quelques 4 étoiles)
- Génère des cartes de bienfaits avec des emojis appropriés au produit
- Génère une FAQ pertinente et spécifique au produit avec des questions que les clients poseraient vraiment
- Langue: ${language === 'fr' ? 'Français' : 'English'}`;

    const userPrompt = `Reformule ce produit pour une boutique e-commerce premium:

TITRE ORIGINAL: ${title}

${description ? `DESCRIPTION ORIGINALE: ${description}` : ''}

Réponds UNIQUEMENT avec un JSON valide dans ce format exact:
{
  "title": "Titre reformulé court et accrocheur (max 60 caractères)",
  "headline": "Phrase d'accroche principale percutante (max 80 caractères)",
  "description": "Description marketing de 2-3 phrases mettant en avant les bénéfices",
  "benefits": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3", "Bénéfice 4"],
  "cta": "Texte du bouton d'achat",
  "finalCtaTitle": "Question d'accroche personnalisée basée sur le produit, ex: 'Prêt à révolutionner votre routine ?' ou 'Prêt à découvrir le confort ultime ?' (max 50 caractères)",
  "customerReviews": [
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis SPÉCIFIQUE AU PRODUIT, mentionnant une fonctionnalité ou qualité précise", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis technique sur le produit avec détail concret", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis sur l'utilisation quotidienne du produit", "rating": 4}
  ],
  "homeReviews": [
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis GÉNÉRAL sur la boutique/marque: service client, livraison, qualité globale", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis sur l'expérience d'achat et la satisfaction générale", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis mentionnant la confiance en la marque et le service", "rating": 4}
  ],
  "benefitCards": [
    {"icon": "emoji approprié", "title": "Titre court du bienfait 1", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 2", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 3", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 4", "description": "Description courte"}
  ],
  "faq": [
    {"question": "Question fréquente 1 spécifique au produit ?", "answer": "Réponse claire et rassurante"},
    {"question": "Question sur la livraison/utilisation ?", "answer": "Réponse informative"},
    {"question": "Question sur la garantie/retour ?", "answer": "Réponse positive sur le SAV"},
    {"question": "Question technique ou pratique ?", "answer": "Réponse détaillée et utile"}
  ]
}`;

    console.log('Reformulating product text...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Please add credits to continue using AI features' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to reformulate text' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in response');
      return new Response(
        JSON.stringify({ success: false, error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const reformulated = JSON.parse(jsonContent);
      console.log('Reformulation successful');

      return new Response(
        JSON.stringify({
          success: true,
          data: reformulated,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Return a fallback response
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            title: title.slice(0, 60),
            headline: title,
            description: description || 'Découvrez ce produit exceptionnel.',
            benefits: ['Qualité premium', 'Livraison rapide', 'Satisfaction garantie', 'Design élégant'],
            cta: 'Acheter maintenant',
            finalCtaTitle: 'Prêt à découvrir ce produit ?',
            customerReviews: [
              { name: 'Marie C.', initials: 'MC', text: 'Excellent produit, la qualité est au rendez-vous !', rating: 5 },
              { name: 'Jean D.', initials: 'JD', text: 'Fonctionne parfaitement, très satisfait.', rating: 5 },
              { name: 'Sophie L.', initials: 'SL', text: 'Bon rapport qualité-prix, je recommande.', rating: 4 }
            ],
            homeReviews: [
              { name: 'Lucas M.', initials: 'LM', text: 'Service client réactif et livraison rapide !', rating: 5 },
              { name: 'Emma R.', initials: 'ER', text: 'Boutique sérieuse, je recommande vivement.', rating: 5 },
              { name: 'Thomas B.', initials: 'TB', text: 'Très bonne expérience d\'achat.', rating: 4 }
            ],
            benefitCards: [
              { icon: '✨', title: 'Qualité Premium', description: 'Matériaux haut de gamme' },
              { icon: '🚀', title: 'Livraison Rapide', description: 'Expédié en 24h' },
              { icon: '🛡️', title: 'Garantie', description: 'Satisfait ou remboursé' },
              { icon: '💯', title: 'Fiabilité', description: 'Testé et approuvé' }
            ],
            faq: [
              { question: 'Quel est le délai de livraison ?', answer: 'Votre commande est expédiée sous 24-48h et livrée en 3-5 jours ouvrés.' },
              { question: 'Puis-je retourner le produit ?', answer: 'Oui, vous bénéficiez de 30 jours pour retourner le produit si vous n\'êtes pas satisfait.' },
              { question: 'Le produit est-il garanti ?', answer: 'Tous nos produits sont garantis 1 an contre les défauts de fabrication.' },
              { question: 'Comment contacter le service client ?', answer: 'Notre équipe est disponible 7j/7 par email pour répondre à toutes vos questions.' }
            ]
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error reformulating:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reformulate';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
