import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Features } from "@/components/Features";
import { MoreFeatures } from "@/components/MoreFeatures";
import { HowItWorks } from "@/components/HowItWorks";
import { CallToAction } from "@/components/CallToAction";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Features />
      <MoreFeatures />
      <HowItWorks />
      <CallToAction />
      <Chatbot />
    </main>
  );
};

export default Index;
