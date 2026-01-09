import DashboardLayout from "@/components/DashboardLayout";
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

const helpItems = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Guides et tutoriels pour bien démarrer",
    link: "#",
  },
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Questions fréquemment posées",
    link: "#",
  },
  {
    icon: Mail,
    title: "Contact",
    description: "support@dropyfy.com",
    link: "mailto:support@dropyfy.com",
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
        <div className="space-y-3">
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

        {/* Footer */}
        <div className="mt-12 text-center">
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
