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
- Génère des avis clients réalistes et crédibles en rapport avec le produit
- Génère des cartes de bienfaits avec des emojis appropriés au produit
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
  "customerReviews": [
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis positif réaliste et spécifique au produit (max 100 caractères)", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis positif différent et crédible (max 100 caractères)", "rating": 5},
    {"name": "Prénom + initiale nom", "initials": "XX", "text": "Avis positif mentionnant un bénéfice concret (max 100 caractères)", "rating": 5}
  ],
  "benefitCards": [
    {"icon": "emoji approprié", "title": "Titre court du bienfait 1", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 2", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 3", "description": "Description courte"},
    {"icon": "emoji approprié", "title": "Titre court du bienfait 4", "description": "Description courte"}
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
            customerReviews: [
              { name: 'Marie C.', initials: 'MC', text: 'Excellent produit, je recommande !', rating: 5 },
              { name: 'Jean D.', initials: 'JD', text: 'Très satisfait de mon achat.', rating: 5 },
              { name: 'Sophie L.', initials: 'SL', text: 'Qualité au rendez-vous !', rating: 5 }
            ],
            benefitCards: [
              { icon: '✨', title: 'Qualité Premium', description: 'Matériaux haut de gamme' },
              { icon: '🚀', title: 'Livraison Rapide', description: 'Expédié en 24h' },
              { icon: '🛡️', title: 'Garantie', description: 'Satisfait ou remboursé' },
              { icon: '💯', title: 'Fiabilité', description: 'Testé et approuvé' }
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
