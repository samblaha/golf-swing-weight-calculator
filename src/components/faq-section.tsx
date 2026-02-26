import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQS = [
  {
    question: "What is swing weight versus total weight?",
    answer:
      "Total weight is how heavy the club is on a scale. Swing weight is how that weight is distributed, especially how heavy the head feels during the swing.",
  },
  {
    question: "How much head weight changes swing weight by one point?",
    answer: "A reliable starting rule is adding about 2 grams to the head for +1 swingweight point.",
  },
  {
    question: "Can I use this for drivers, irons, and wedges?",
    answer:
      "Yes. The same swingweight physics applies across club types. Component mode is useful while planning a build before full assembly.",
  },
  {
    question: "How should I choose between D2 and D3?",
    answer:
      "D3 generally feels slightly more head-heavy than D2. Start with your current feel and adjust in small steps using target swingweight guidance.",
  },
];

interface FaqSectionProps {
  discrete?: boolean;
}

export function FaqSection({ discrete = false }: FaqSectionProps) {
  if (discrete) {
    return (
      <section className="rounded-xl border bg-card/70 px-4 py-3 shadow-sm">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
            <span>FAQ</span>
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-2">
            {FAQS.map((faq) => (
              <details key={faq.question} className="rounded-md border bg-background/70 px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-foreground">{faq.question}</summary>
                <p className="mt-2 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </details>
      </section>
    );
  }

  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {FAQS.map((faq) => (
          <details key={faq.question} className="rounded-md border px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium">{faq.question}</summary>
            <p className="mt-2 text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </CardContent>
    </Card>
  );
}
