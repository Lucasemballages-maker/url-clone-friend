import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureTabs from "@/components/FeatureTabs";
import BenefitsGrid from "@/components/BenefitsGrid";
import StepsSection from "@/components/StepsSection";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeatureTabs />
      <BenefitsGrid />
      <StepsSection />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
