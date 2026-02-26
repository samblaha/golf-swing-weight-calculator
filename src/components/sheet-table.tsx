import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TargetSwPicker } from "@/components/target-sw-picker";
import {
  classForDelta,
  computeMetrics,
  formatNullable,
  formatSignedNullable,
} from "@/lib/swingweight";
import type { CalculatorMode, ClubRow, UnitSystem } from "@/types";

const TABLE_VIEW_STORAGE_KEY = "swingweight-bag-lab-table-view-v1";

type TableViewMode = "simple" | "details";

function badgeClassForDelta(value: number | null): string {
  if (value === null) {
    return "border-border bg-muted/40 text-muted-foreground";
  }

  const abs = Math.abs(value);
  if (abs === 0) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  }
  if (abs <= 2) {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
  }

  return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300";
}

interface SheetTableProps {
  rows: ClubRow[];
  calculatorMode: CalculatorMode;
  unitSystem: UnitSystem;
  onCalculatorModeChange: (mode: CalculatorMode) => void;
  onUnitSystemChange: (unitSystem: UnitSystem) => void;
  onAddClub?: () => void;
  onResetTemplate?: () => void;
  onRowChange: (rowId: string, field: keyof ClubRow, value: string) => void;
  onRemoveRow: (rowId: string) => void;
}

export function SheetTable({
  rows,
  calculatorMode,
  unitSystem,
  onCalculatorModeChange,
  onUnitSystemChange,
  onAddClub,
  onResetTemplate,
  onRowChange,
  onRemoveRow,
}: SheetTableProps) {
  const balanceUnit = unitSystem === "metric" ? "cm" : "in";
  const [viewMode, setViewMode] = useState<TableViewMode>(() => {
    if (typeof window === "undefined") {
      return "simple";
    }

    const stored = window.localStorage.getItem(TABLE_VIEW_STORAGE_KEY);
    return stored === "details" ? "details" : "simple";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(TABLE_VIEW_STORAGE_KEY, viewMode);
    } catch {
      // no-op
    }
  }, [viewMode]);

  const showDetails = viewMode === "details";

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">No clubs yet.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {onAddClub ? (
            <Button type="button" size="sm" onClick={onAddClub}>
              Add Club
            </Button>
          ) : null}
          {onResetTemplate ? (
            <Button type="button" size="sm" variant="outline" onClick={onResetTemplate}>
              Reset Template
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-2">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium uppercase tracking-wide">Mode</span>
            <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
              <Button
                type="button"
                size="xs"
                variant={calculatorMode === "basic" ? "secondary" : "ghost"}
                aria-pressed={calculatorMode === "basic"}
                onClick={() => onCalculatorModeChange("basic")}
              >
                Basic
              </Button>
              <Button
                type="button"
                size="xs"
                variant={calculatorMode === "components" ? "secondary" : "ghost"}
                aria-pressed={calculatorMode === "components"}
                onClick={() => onCalculatorModeChange("components")}
              >
                Components
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium uppercase tracking-wide">View</span>
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
            <Button
              type="button"
              size="xs"
              variant={viewMode === "simple" ? "secondary" : "ghost"}
              aria-pressed={viewMode === "simple"}
              onClick={() => setViewMode("simple")}
            >
              Simple
            </Button>
            <Button
              type="button"
              size="xs"
              variant={viewMode === "details" ? "secondary" : "ghost"}
              aria-pressed={viewMode === "details"}
              onClick={() => setViewMode("details")}
            >
              Details
            </Button>
          </div>
        </div>
      </div>

      <div className="max-h-[68vh] overflow-auto">
        <Table className={showDetails ? "min-w-[1480px] text-xs" : "min-w-[1080px] text-xs"}>
          <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
            <TableRow>
              <TableHead className="w-[140px]">Club</TableHead>
              {calculatorMode === "basic" ? (
                <>
                  <TableHead className="w-[120px]">Weight ({unitSystem === "metric" ? "g" : "oz"})</TableHead>
                  <TableHead className="w-[140px]">Balance Pt ({balanceUnit})</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="w-[120px]">Head ({unitSystem === "metric" ? "g" : "oz"})</TableHead>
                  <TableHead className="w-[120px]">Shaft ({unitSystem === "metric" ? "g" : "oz"})</TableHead>
                  <TableHead className="w-[120px]">Grip ({unitSystem === "metric" ? "g" : "oz"})</TableHead>
                  <TableHead className="w-[120px]">Length ({unitSystem === "metric" ? "cm" : "in"})</TableHead>
                </>
              )}
              {showDetails ? <TableHead>Inch-grams</TableHead> : null}
              {showDetails ? <TableHead>Lorythmic (oz·in)</TableHead> : null}
              {showDetails ? <TableHead>Official (oz)</TableHead> : null}
              <TableHead>Current SW</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="w-[130px]">Target SW</TableHead>
              {showDetails ? <TableHead>Current Pts</TableHead> : null}
              {showDetails ? <TableHead>Target Pts</TableHead> : null}
              <TableHead>Points Needed</TableHead>
              <TableHead>Head +/- g</TableHead>
              <TableHead>Grip +/- g</TableHead>
              {showDetails ? <TableHead>Length +/- in</TableHead> : null}
              {showDetails ? <TableHead className="min-w-[220px]">Notes</TableHead> : null}
              <TableHead className="w-[64px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => {
              const metrics = computeMetrics(row, calculatorMode, unitSystem);
              const deltaClass = classForDelta(metrics.deltaPoints);

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

                  {calculatorMode === "basic" ? (
                    <>
                      <TableCell>
                        <Input
                          value={row.clubWeight}
                          onChange={(event) => onRowChange(row.id, "clubWeight", event.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          aria-invalid={Number(row.clubWeight) < 0}
                          className="h-8"
                          placeholder="0"
                        />
                      </TableCell>

                      <TableCell>
                        <div className="relative">
                          <Input
                            value={row.balancePoint}
                            onChange={(event) => onRowChange(row.id, "balancePoint", event.target.value)}
                            type="number"
                            step="0.01"
                            min="0"
                            aria-invalid={Number(row.balancePoint) < 0}
                            className="h-8 pr-10"
                            placeholder="0"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {balanceUnit}
                          </span>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <Input
                          value={row.headWeight}
                          onChange={(event) => onRowChange(row.id, "headWeight", event.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          className="h-8"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.shaftWeight}
                          onChange={(event) => onRowChange(row.id, "shaftWeight", event.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          className="h-8"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.gripWeight}
                          onChange={(event) => onRowChange(row.id, "gripWeight", event.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          className="h-8"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.clubLength}
                          onChange={(event) => onRowChange(row.id, "clubLength", event.target.value)}
                          type="number"
                          step="0.1"
                          min="0"
                          className="h-8"
                          placeholder="0"
                        />
                      </TableCell>
                    </>
                  )}

                  {showDetails ? (
                    <TableCell className="font-mono tabular-nums">{formatNullable(metrics.inchGrams, 0)}</TableCell>
                  ) : null}
                  {showDetails ? (
                    <TableCell className="font-mono tabular-nums">{formatNullable(metrics.lorythmicScale, 2)}</TableCell>
                  ) : null}
                  {showDetails ? (
                    <TableCell className="font-mono tabular-nums">{formatNullable(metrics.officialScale, 2)}</TableCell>
                  ) : null}

                  <TableCell>
                    {metrics.currentSWLabel ? (
                      <Badge variant="outline" className="font-mono tabular-nums">
                        {metrics.currentSWLabel}
                      </Badge>
                    ) : metrics.currentOutOfRange ? (
                      <Badge variant="destructive">Out</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{metrics.swingWeightGrade ?? "-"}</TableCell>

                  <TableCell>
                    <TargetSwPicker
                      value={row.targetSW}
                      currentSWLabel={metrics.currentSWLabel}
                      onChange={(next) => onRowChange(row.id, "targetSW", next)}
                    />
                  </TableCell>

                  {showDetails ? (
                    <TableCell className="font-mono tabular-nums">{formatNullable(metrics.currentPoints, 1)}</TableCell>
                  ) : null}
                  {showDetails ? (
                    <TableCell className="font-mono tabular-nums">{formatNullable(metrics.targetPoints, 0)}</TableCell>
                  ) : null}

                  <TableCell>
                    <Badge variant="outline" className={`font-mono tabular-nums ${badgeClassForDelta(metrics.deltaPoints)}`}>
                      {formatSignedNullable(metrics.deltaPoints, 1)}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-mono tabular-nums ${deltaClass}`}>
                    {formatSignedNullable(metrics.headAdjustment, 1)}
                  </TableCell>
                  <TableCell className={`font-mono tabular-nums ${deltaClass}`}>
                    {formatSignedNullable(metrics.gripAdjustment, 1)}
                  </TableCell>
                  {showDetails ? (
                    <TableCell className={`font-mono tabular-nums ${deltaClass}`}>
                      {formatSignedNullable(metrics.lengthAdjustment, 1)}
                    </TableCell>
                  ) : null}

                  {showDetails ? (
                    <TableCell>
                      <Input
                      value={row.notes}
                      onChange={(event) => onRowChange(row.id, "notes", event.target.value)}
                      placeholder="Notes"
                      className="h-8"
                    />
                  </TableCell>
                  ) : null}

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
