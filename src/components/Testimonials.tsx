import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "C'est facile et accessible même aux débutants. J'ai pu générer ma boutique en quelques minutes.",
    author: "Régis",
    role: "Entrepreneur E-commerce",
  },
  {
    quote: "C'est le seul outil dont j'ai eu besoin pour commencer l'ecom. Il y a tout ce qu'il faut.",
    author: "Sara",
    role: "Dropshipper",
  },
  {
    quote: "J'étais débutant complet. Je n'avais jamais créé de boutique avant. Avec Copyfy, ça m'a pris 5 minutes pour lancer mon shop.",
    author: "Julien Blois",
    role: "Brand Owner",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 card-hover border-gradient relative"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              
              <blockquote className="text-lg leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-4">
                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <span className="font-semibold text-lg">
                    {testimonial.author[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
