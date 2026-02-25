import type { CalculatorMode, ClubRow, ComputedMetrics, SwingWeightPoint, UnitSystem } from "@/types";

export const FULCRUM_INCHES = 14;
export const A0_INCH_GRAMS = 4550;
export const RANGE_STEP_INCH_GRAMS = 500;
export const POINT_STEP_INCH_GRAMS = 50;
export const MAX_INCH_GRAMS = A0_INCH_GRAMS + 7 * RANGE_STEP_INCH_GRAMS - 1;
export const GRAMS_PER_OUNCE = 28.349523125;
export const OFFICIAL_SCALE_RATIO = 33.15;

export const SW_MAP: SwingWeightPoint[] = buildSwingWeightMap();
export const SW_OPTIONS = SW_MAP.map((item) => item.label);
export const SW_LABEL_TO_POINTS = new Map(SW_MAP.map((item) => [item.label, item.points]));

export function computeMetrics(
  row: ClubRow,
  calculatorMode: CalculatorMode = "basic",
  unitSystem: UnitSystem = "metric",
): ComputedMetrics {
  const parseWeight = (value: string) => {
    const parsed = toNumber(value);
    if (parsed === null) {
      return null;
    }
    return unitSystem === "imperial" ? parsed * GRAMS_PER_OUNCE : parsed;
  };
  const parseLengthInches = (value: string) => {
    const parsed = toNumber(value);
    if (parsed === null) {
      return null;
    }
    return unitSystem === "imperial" ? parsed : parsed / 2.54;
  };

  const basicClubWeight = parseWeight(row.clubWeight);
  const headWeight = parseWeight(row.headWeight);
  const shaftWeight = parseWeight(row.shaftWeight);
  const gripWeight = parseWeight(row.gripWeight);
  const clubLengthInches = parseLengthInches(row.clubLength);

  const componentTotalWeight =
    headWeight !== null && shaftWeight !== null && gripWeight !== null ? headWeight + shaftWeight + gripWeight : null;

  let componentBalancePointInches: number | null = null;
  if (
    componentTotalWeight !== null &&
    clubLengthInches !== null &&
    headWeight !== null &&
    shaftWeight !== null &&
    gripWeight !== null
  ) {
    componentBalancePointInches = estimateBalancePointInches({
      clubLengthInches,
      headWeight,
      shaftWeight,
      gripWeight,
      totalWeight: componentTotalWeight,
    });
  }

  const clubWeight = calculatorMode === "components" ? componentTotalWeight : basicClubWeight;
  const balancePointRaw = toNumber(row.balancePoint);
  const basicBalancePointInches =
    Number.isFinite(balancePointRaw) && balancePointRaw != null
      ? row.balanceUnit === "cm"
        ? balancePointRaw / 2.54
        : balancePointRaw
      : null;
  const balancePointInches = calculatorMode === "components" ? componentBalancePointInches : basicBalancePointInches;

  let inchGrams: number | null = null;
  let currentPoints: number | null = null;
  let currentSWLabel: string | null = null;
  let swingWeightGrade: string | null = null;
  let currentOutOfRange = false;
  let lorythmicScale: number | null = null;
  let officialScale: number | null = null;

  if (clubWeight !== null && balancePointInches !== null) {
    inchGrams = Math.round((balancePointInches - FULCRUM_INCHES) * clubWeight);
    const swingWeight = swingweightFromInchGrams(inchGrams);
    currentPoints = swingWeight.points;
    currentSWLabel = swingWeight.label;
    swingWeightGrade = swingweightGradeFromPoints(swingWeight.points);
    currentOutOfRange = swingWeight.outOfRange;
    lorythmicScale = toLorythmicScale(inchGrams);
    officialScale = toOfficialScale(lorythmicScale);
  }

  const targetPoints = row.targetSW ? SW_LABEL_TO_POINTS.get(row.targetSW) ?? null : null;

  const deltaPoints = currentPoints !== null && targetPoints !== null ? targetPoints - currentPoints : null;

  const headAdjustment = deltaPoints !== null ? round(deltaPoints * 2, 1) : null;
  const gripAdjustment = deltaPoints !== null ? round(deltaPoints * -4, 1) : null;
  const lengthAdjustment = deltaPoints !== null ? round(deltaPoints / 6, 1) : null;

  return {
    clubWeight,
    balancePointInches,
    clubLengthInches,
    componentTotalWeight,
    lorythmicScale,
    officialScale,
    inchGrams,
    currentPoints,
    currentSWLabel,
    swingWeightGrade,
    currentOutOfRange,
    targetPoints,
    deltaPoints,
    headAdjustment,
    gripAdjustment,
    lengthAdjustment,
  };
}

export function swingweightFromInchGrams(inchGrams: number): {
  points: number | null;
  label: string | null;
  outOfRange: boolean;
} {
  if (!Number.isFinite(inchGrams)) {
    return { points: null, label: null, outOfRange: false };
  }

  if (inchGrams < A0_INCH_GRAMS || inchGrams > MAX_INCH_GRAMS) {
    return { points: null, label: null, outOfRange: true };
  }

  const rangeIndex = Math.floor((inchGrams - A0_INCH_GRAMS) / RANGE_STEP_INCH_GRAMS);
  const rangeStart = A0_INCH_GRAMS + rangeIndex * RANGE_STEP_INCH_GRAMS;
  const offset = inchGrams - rangeStart;

  const decimal = Math.min(offset / POINT_STEP_INCH_GRAMS, 9.9);
  const points = round(rangeIndex * 10 + decimal, 1);
  const letter = "ABCDEFG"[rangeIndex] ?? "A";
  const label = `${letter} ${decimal.toFixed(1)}`;

  return { points, label, outOfRange: false };
}

export function toNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }

  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNullable(value: number | null, digits: number): string {
  if (value === null) {
    return "-";
  }
  return value.toFixed(digits);
}

export function formatSignedNullable(value: number | null, digits: number): string {
  if (value === null) {
    return "-";
  }

  const fixed = value.toFixed(digits);
  return value > 0 ? `+${fixed}` : fixed;
}

export function classForDelta(value: number | null): string {
  if (value === null) {
    return "";
  }

  const abs = Math.abs(value);
  if (abs === 0) {
    return "text-emerald-600";
  }
  if (abs <= 2) {
    return "text-amber-600";
  }
  return "text-rose-600";
}

export function averageOrDash(values: number[], digits: number): string {
  if (values.length === 0) {
    return "-";
  }

  const sum = values.reduce((acc, item) => acc + item, 0);
  return round(sum / values.length, digits).toFixed(digits);
}

export function toLorythmicScale(inchGrams: number): number {
  return round(inchGrams / GRAMS_PER_OUNCE, 2);
}

export function toOfficialScale(lorythmicScale: number): number {
  return round(lorythmicScale / OFFICIAL_SCALE_RATIO, 2);
}

export function swingweightGradeFromPoints(points: number | null): string | null {
  if (points === null || !Number.isFinite(points)) {
    return null;
  }

  if (points < 20) {
    return "Light";
  }
  if (points <= 32) {
    return "Standard";
  }
  if (points <= 35) {
    return "Heavy";
  }
  return "Very Heavy";
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function estimateBalancePointInches(args: {
  clubLengthInches: number;
  headWeight: number;
  shaftWeight: number;
  gripWeight: number;
  totalWeight: number;
}): number {
  const gripCenterInches = 5;
  const shaftCenterInches = args.clubLengthInches * 0.43;
  const headCenterInches = Math.max(args.clubLengthInches - 1.5, 0);
  const moment =
    args.headWeight * headCenterInches + args.shaftWeight * shaftCenterInches + args.gripWeight * gripCenterInches;
  return moment / args.totalWeight;
}

function buildSwingWeightMap(): SwingWeightPoint[] {
  const letters = ["A", "B", "C", "D", "E", "F", "G"];
  const map: SwingWeightPoint[] = [];

  letters.forEach((letter, index) => {
    for (let number = 0; number <= 9; number += 1) {
      map.push({ label: `${letter}${number}`, points: index * 10 + number });
    }
  });

  return map;
}
