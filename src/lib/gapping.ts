import type { ClubRow, UnitSystem } from "@/types";

const OVERLAP_MAX = 6;
const HOLE_MIN = 20;

export type GapFlag = "overlap" | "hole";

export interface GappingRowMetrics {
  carry: number | null;
  total: number | null;
  carryGap: number | null;
  totalGap: number | null;
  carryFlag: GapFlag | null;
  totalFlag: GapFlag | null;
  suggestion: string | null;
}

export interface GappingResult {
  byId: Record<string, GappingRowMetrics>;
}

export function parseDistance(raw: string): number | null {
  const cleaned = raw.trim().replaceAll(",", "");
  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function classifyGap(gap: number): GapFlag | null {
  if (gap < OVERLAP_MAX) {
    return "overlap";
  }
  if (gap > HOLE_MIN) {
    return "hole";
  }
  return null;
}

function gapSuggestion(flag: GapFlag, prevClub: string, nextClub: string): string {
  if (flag === "overlap") {
    return `Overlap between ${prevClub} and ${nextClub}. Consider strengthening/weakening loft or dropping one of these clubs.`;
  }
  return `Hole between ${prevClub} and ${nextClub}. Consider adding a club between these (e.g. hybrid/wood/iron) or adjusting loft.`;
}

export function computeGaps(rows: ClubRow[], unitSystem: UnitSystem): GappingResult {
  void unitSystem;

  const byId: Record<string, GappingRowMetrics> = Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        carry: parseDistance(row.carryDistance),
        total: parseDistance(row.totalDistance),
        carryGap: null,
        totalGap: null,
        carryFlag: null,
        totalFlag: null,
        suggestion: null,
      },
    ]),
  );

  const byCarry = rows
    .map((row) => ({ row, value: parseDistance(row.carryDistance) }))
    .filter((item): item is { row: ClubRow; value: number } => item.value !== null)
    .sort((a, b) => b.value - a.value);

  for (let index = 1; index < byCarry.length; index += 1) {
    const prev = byCarry[index - 1];
    const next = byCarry[index];
    const gap = prev.value - next.value;

    const flag = classifyGap(gap);
    byId[next.row.id].carryGap = gap;
    byId[next.row.id].carryFlag = flag;
    if (flag) {
      byId[next.row.id].suggestion ??= gapSuggestion(flag, prev.row.club.trim() || "Previous club", next.row.club.trim() || "Next club");
    }
  }

  const byTotal = rows
    .map((row) => ({ row, value: parseDistance(row.totalDistance) }))
    .filter((item): item is { row: ClubRow; value: number } => item.value !== null)
    .sort((a, b) => b.value - a.value);

  for (let index = 1; index < byTotal.length; index += 1) {
    const prev = byTotal[index - 1];
    const next = byTotal[index];
    const gap = prev.value - next.value;

    const flag = classifyGap(gap);
    byId[next.row.id].totalGap = gap;
    byId[next.row.id].totalFlag = flag;
    if (flag) {
      byId[next.row.id].suggestion ??= gapSuggestion(flag, prev.row.club.trim() || "Previous club", next.row.club.trim() || "Next club");
    }
  }

  return { byId };
}

