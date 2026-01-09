import { Check, Link, Image, Store, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 1, title: "Charger", icon: Link },
  { id: 2, title: "Sélectionner", icon: Image },
  { id: 3, title: "Personnaliser", icon: Palette },
  { id: 4, title: "Mettre à jour le thème", icon: Store },
];

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-primary/20 text-primary",
                !isActive && !isCompleted && "bg-secondary text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{step.id}. {step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center mx-2 text-muted-foreground">
                <span className="text-muted-foreground/50">›</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
