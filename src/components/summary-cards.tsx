import { Badge } from "@/components/ui/badge";

interface SummaryCardsProps {
  clubCount: number;
  averagePoints: string;
  averageInchGrams: string;
  rowsWithSwingweight: number;
}

export function SummaryCards({
  clubCount,
  averagePoints,
  averageInchGrams,
  rowsWithSwingweight,
}: SummaryCardsProps) {
  return (
    <section
      aria-label="Bag summary"
      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      <Badge variant="secondary" className="gap-2 px-3 py-1">
        <span>Clubs</span>
        <span className="font-semibold tabular-nums text-foreground">{clubCount}</span>
      </Badge>

      <Badge variant="outline" className="gap-2 px-3 py-1">
        <span>Avg SW pts</span>
        <span className="font-semibold tabular-nums text-foreground">{averagePoints}</span>
      </Badge>

      <Badge variant="outline" className="gap-2 px-3 py-1">
        <span>Avg inch-g</span>
        <span className="font-semibold tabular-nums text-foreground">{averageInchGrams}</span>
      </Badge>

      <Badge variant="outline" className="gap-2 px-3 py-1">
        <span>SW filled</span>
        <span className="font-semibold tabular-nums text-foreground">
          {rowsWithSwingweight}/{clubCount}
        </span>
      </Badge>
    </section>
  );
}
