import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_ROWS = [
  {
    range: "C0 - C9",
    classification: "Light",
    target: "Juniors / Seniors / Tempo-focused players",
    adjustment: "Add ~2.0 g to head for +1 point",
  },
  {
    range: "D0 - D2",
    classification: "Standard",
    target: "Most amateurs",
    adjustment: "Add ~2.0 g to head for +1 point",
  },
  {
    range: "D3 - D5",
    classification: "Heavy",
    target: "Stronger players / lower launch preference",
    adjustment: "Add ~2.0 g to head for +1 point",
  },
  {
    range: "D6 - E9",
    classification: "Very Heavy",
    target: "Tour-like head feel / specialty builds",
    adjustment: "Add ~2.0 g to head for +1 point",
  },
];

export function SwingweightChart() {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Swing Weight Chart & Adjustments</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Range</th>
                <th className="px-3 py-2 font-medium">Class</th>
                <th className="px-3 py-2 font-medium">Typical Golfer</th>
                <th className="px-3 py-2 font-medium">+1 Point Rule</th>
              </tr>
            </thead>
            <tbody>
              {CHART_ROWS.map((row) => (
                <tr key={row.range} className="border-t">
                  <td className="px-3 py-2 font-mono">{row.range}</td>
                  <td className="px-3 py-2">{row.classification}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.target}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.adjustment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
