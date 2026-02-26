export type BalanceUnit = "in" | "cm";
export type CalculatorMode = "basic" | "components";
export type UnitSystem = "metric" | "imperial";

export interface ClubRow {
  id: string;
  club: string;
  clubWeight: string;
  balancePoint: string;
  balanceUnit: BalanceUnit;
  headWeight: string;
  shaftWeight: string;
  gripWeight: string;
  clubLength: string;
  carryDistance: string;
  totalDistance: string;
  targetSW: string;
  notes: string;
}

export interface BagProfile {
  id: string;
  name: string;
  calculatorMode: CalculatorMode;
  unitSystem: UnitSystem;
  rows: ClubRow[];
  updatedAt: number;
}

export interface AppState {
  profiles: BagProfile[];
  activeProfileId: string;
}

export interface ComputedMetrics {
  clubWeight: number | null;
  balancePointInches: number | null;
  clubLengthInches: number | null;
  componentTotalWeight: number | null;
  lorythmicScale: number | null;
  officialScale: number | null;
  inchGrams: number | null;
  currentPoints: number | null;
  currentSWLabel: string | null;
  swingWeightGrade: string | null;
  currentOutOfRange: boolean;
  targetPoints: number | null;
  deltaPoints: number | null;
  headAdjustment: number | null;
  gripAdjustment: number | null;
  lengthAdjustment: number | null;
}

export interface SwingWeightPoint {
  label: string;
  points: number;
}
