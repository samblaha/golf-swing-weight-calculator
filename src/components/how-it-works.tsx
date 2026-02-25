import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  "Select Basic mode for assembled-club inputs or Components mode for build planning.",
  "Enter your measurements using metric or imperial units.",
  "Review your swing weight label, grade, and calculated scale outputs.",
  "Set a target swing weight and use adjustment guidance to close the gap.",
];

export function HowItWorks() {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">How the Swing Weight Calculator Works</CardTitle>
        <CardDescription>Use this flow for DIY checks and component planning.</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
