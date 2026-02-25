import { FaqSection } from "@/components/faq-section";
import { HowItWorks } from "@/components/how-it-works";
import { SwingweightChart } from "@/components/swingweight-chart";
import { SwingweightFormula } from "@/components/swingweight-formula";

export function EducationalSection() {
  return (
    <section className="grid gap-3" aria-label="Swing weight education">
      <div className="grid gap-3 lg:grid-cols-2">
        <HowItWorks />
        <SwingweightFormula />
      </div>
      <SwingweightChart />
      <FaqSection />
    </section>
  );
}
