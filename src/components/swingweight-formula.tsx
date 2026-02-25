import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SwingweightFormula() {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">Swing Weight Formula</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <p className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs">
          Torque = Total Weight × (Balance Point - 14 in)
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Total weight is the assembled club mass (head + shaft + grip).</li>
          <li>Balance point is measured from grip end to fulcrum balance point.</li>
          <li>14 inches is the reference fulcrum used by swingweight scales.</li>
        </ul>
        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Rules of thumb: +2 g head ≈ +1 point, +4 g grip ≈ -1 point, +0.5 in length ≈ +3 points.
        </div>
      </CardContent>
    </Card>
  );
}
