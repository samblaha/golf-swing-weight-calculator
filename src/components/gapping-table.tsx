import { useMemo } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeGaps } from "@/lib/gapping";
import type { ClubRow, UnitSystem } from "@/types";

interface GappingTableProps {
  rows: ClubRow[];
  unitSystem: UnitSystem;
  onUnitSystemChange: (unitSystem: UnitSystem) => void;
  onRowChange: (rowId: string, field: keyof ClubRow, value: string) => void;
  onRemoveRow: (rowId: string) => void;
}

function flagBadge(flag: "overlap" | "hole") {
  if (flag === "hole") {
    return (
      <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        Hole
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      Overlap
    </Badge>
  );
}

function formatGap(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(0);
}

export function GappingTable({ rows, unitSystem, onUnitSystemChange, onRowChange, onRemoveRow }: GappingTableProps) {
  const distanceUnitLabel = unitSystem === "metric" ? "m" : "yd";
  const gapping = useMemo(() => computeGaps(rows, unitSystem), [rows, unitSystem]);

  if (rows.length === 0) {
    return <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">No clubs yet.</div>;
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-2">
        <div className="text-xs text-muted-foreground">
          Flags: overlap &lt; 6, hole &gt; 20 (carry or total).
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">System</span>
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
            <Button
              type="button"
              size="xs"
              variant={unitSystem === "metric" ? "secondary" : "ghost"}
              aria-pressed={unitSystem === "metric"}
              onClick={() => onUnitSystemChange("metric")}
            >
              Metric
            </Button>
            <Button
              type="button"
              size="xs"
              variant={unitSystem === "imperial" ? "secondary" : "ghost"}
              aria-pressed={unitSystem === "imperial"}
              onClick={() => onUnitSystemChange("imperial")}
            >
              Imperial
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[68vh] overflow-auto">
        <Table className="min-w-[1180px] text-xs">
          <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
            <TableRow>
              <TableHead className="w-[160px]">Club</TableHead>
              <TableHead className="w-[140px]">Carry ({distanceUnitLabel})</TableHead>
              <TableHead className="w-[140px]">Total ({distanceUnitLabel})</TableHead>
              <TableHead className="w-[120px]">Gap (Carry)</TableHead>
              <TableHead className="w-[120px]">Gap (Total)</TableHead>
              <TableHead className="w-[120px]">Flags</TableHead>
              <TableHead>Suggestion</TableHead>
              <TableHead className="w-[64px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => {
              const metrics = gapping.byId[row.id];
              const flags = [metrics?.carryFlag, metrics?.totalFlag].filter(Boolean) as Array<"overlap" | "hole">;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.club}
                      onChange={(event) => onRowChange(row.id, "club", event.target.value)}
                      placeholder="Club"
                      className="h-8"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      value={row.carryDistance}
                      onChange={(event) => onRowChange(row.id, "carryDistance", event.target.value)}
                      type="number"
                      step="1"
                      min="0"
                      className="h-8"
                      placeholder="0"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      value={row.totalDistance}
                      onChange={(event) => onRowChange(row.id, "totalDistance", event.target.value)}
                      type="number"
                      step="1"
                      min="0"
                      className="h-8"
                      placeholder="0"
                    />
                  </TableCell>

                  <TableCell className="font-mono tabular-nums">{formatGap(metrics?.carryGap ?? null)}</TableCell>
                  <TableCell className="font-mono tabular-nums">{formatGap(metrics?.totalGap ?? null)}</TableCell>

                  <TableCell className="space-x-1">
                    {flags.length === 0 ? <span className="text-muted-foreground">-</span> : flags.map((flag, index) => <span key={`${flag}-${index}`}>{flagBadge(flag)}</span>)}
                  </TableCell>

                  <TableCell className="text-muted-foreground">{metrics?.suggestion ?? "-"}</TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRow(row.id)}
                      aria-label="Remove row"
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

