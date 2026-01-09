import DashboardLayout from "@/components/DashboardLayout";
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const helpItems = [
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Questions fréquemment posées",
    link: "#faq",
  },
  {
    icon: Mail,
    title: "Contact",
    description: "support@dropyfy.com",
    link: "mailto:support@dropyfy.com",
  },
];

const faqItems = [
  {
    question: "Comment créer ma première boutique ?",
    answer: "Collez simplement un lien de produit AliExpress dans le dashboard, choisissez la langue et cliquez sur 'Générer'. L'IA créera automatiquement votre boutique en moins de 2 minutes.",
  },
  {
    question: "Quels types de liens sont supportés ?",
    answer: "Nous supportons actuellement les liens AliExpress. Le support pour Amazon et d'autres plateformes est prévu prochainement.",
  },
  {
    question: "Comment connecter ma boutique à Shopify ?",
    answer: "Une fois votre boutique créée, cliquez sur 'Connecter à Shopify' à l'étape 4. Vous serez redirigé vers la page de tarification pour choisir un abonnement, puis votre produit sera automatiquement exporté vers Shopify.",
  },
  {
    question: "Puis-je modifier ma boutique après sa création ?",
    answer: "Oui, vous pouvez modifier tous les éléments de votre boutique : textes, images, couleurs et prix. Retrouvez vos boutiques dans la section 'Mes apps'.",
  },
  {
    question: "Comment fonctionne la génération d'images IA ?",
    answer: "Notre IA génère automatiquement des images professionnelles de votre produit dans différents styles (lifestyle, studio). Vous pouvez également générer des images supplémentaires à l'étape 2.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe. Tous les paiements sont sécurisés.",
  },
  {
    question: "Comment annuler mon abonnement ?",
    answer: "Pour annuler votre abonnement, envoyez-nous une demande par email à support@dropyfy.com en précisant l'adresse email associée à votre compte. Nous traiterons votre demande sous 48h ouvrées.",
  },
];

const Help = () => {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Centre d'aide</h1>
          <p className="text-muted-foreground">
            Comment pouvons-nous vous aider ?
          </p>
        </div>

        {/* Help Items */}
        <div className="space-y-3 mb-12">
          {helpItems.map((item) => (
            <a
              key={item.title}
              href={item.link}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* FAQ Section */}
        <div id="faq" className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Besoin d'une assistance immédiate ?
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@dropyfy.com">
              <Mail className="w-4 h-4 mr-2" />
              Contacter le support
            </a>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;
