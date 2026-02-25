import type { AppState, BagProfile, ClubRow, CalculatorMode, UnitSystem } from "@/types";

const STORAGE_KEY = "swingweight-bag-lab-react-v1";

const DEFAULT_CLUBS = [
  { club: "Driver", targetSW: "" },
  { club: "3W", targetSW: "" },
  { club: "5W", targetSW: "" },
  { club: "4i", targetSW: "" },
  { club: "5i", targetSW: "D5" },
  { club: "6i", targetSW: "" },
  { club: "7i", targetSW: "" },
  { club: "8i", targetSW: "" },
  { club: "9i", targetSW: "" },
  { club: "PW", targetSW: "D5" },
  { club: "GW", targetSW: "" },
  { club: "SW", targetSW: "" },
  { club: "LW", targetSW: "" },
  { club: "Putter", targetSW: "" },
] as const;

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return makeInitialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return makeInitialState();
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || !Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return makeInitialState();
    }

    const profiles = parsed.profiles.map(normalizeProfile).filter(Boolean) as BagProfile[];
    if (profiles.length === 0) {
      return makeInitialState();
    }

    const activeProfileId = profiles.some((profile) => profile.id === parsed.activeProfileId)
      ? String(parsed.activeProfileId)
      : profiles[0].id;

    return {
      profiles,
      activeProfileId,
    };
  } catch {
    return makeInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
}

export function createProfile(name: string): BagProfile {
  return {
    id: makeId(),
    name,
    calculatorMode: "basic",
    unitSystem: "metric",
    rows: createDefaultRows(),
    updatedAt: Date.now(),
  };
}

export function createDefaultRows(): ClubRow[] {
  return DEFAULT_CLUBS.map((club) => ({
    id: makeId(),
    club: club.club,
    clubWeight: "",
    balancePoint: "",
    balanceUnit: "in",
    headWeight: "",
    shaftWeight: "",
    gripWeight: "",
    clubLength: "",
    targetSW: club.targetSW,
    notes: "",
  }));
}

export function createBlankRow(): ClubRow {
  return {
    id: makeId(),
    club: "",
    clubWeight: "",
    balancePoint: "",
    balanceUnit: "in",
    headWeight: "",
    shaftWeight: "",
    gripWeight: "",
    clubLength: "",
    targetSW: "",
    notes: "",
  };
}

export function makeInitialState(): AppState {
  const profile = createProfile("Main Bag");
  return {
    profiles: [profile],
    activeProfileId: profile.id,
  };
}

function normalizeProfile(profile: unknown): BagProfile | null {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const value = profile as Partial<BagProfile>;
  const calculatorMode: CalculatorMode = value.calculatorMode === "components" ? "components" : "basic";
  const unitSystem: UnitSystem = value.unitSystem === "imperial" ? "imperial" : "metric";
  const rows = Array.isArray(value.rows)
    ? value.rows.map(normalizeRow).filter(Boolean)
    : createDefaultRows();

  return {
    id: value.id ? String(value.id) : makeId(),
    name: value.name ? String(value.name) : "Bag",
    calculatorMode,
    unitSystem,
    rows: rows as ClubRow[],
    updatedAt: Number.isFinite(value.updatedAt) ? Number(value.updatedAt) : Date.now(),
  };
}

function normalizeRow(row: unknown): ClubRow | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const value = row as Partial<Omit<ClubRow, "balanceUnit">> & { balanceUnit?: string };
  const balancePointRaw = value.balancePoint != null ? String(value.balancePoint) : "";
  const parsedBalancePoint = Number(balancePointRaw.trim());
  const balancePointNumber = Number.isFinite(parsedBalancePoint) ? parsedBalancePoint : null;

  const normalizeBalance = (): { balanceUnit: ClubRow["balanceUnit"]; balancePoint: string } => {
    if (value.balanceUnit === "cm") {
      return { balanceUnit: "cm", balancePoint: balancePointRaw };
    }

    if (value.balanceUnit === "mm") {
      return {
        balanceUnit: "cm",
        balancePoint: balancePointNumber === null ? balancePointRaw : String(balancePointNumber / 10),
      };
    }

    return { balanceUnit: "in", balancePoint: balancePointRaw };
  };

  const normalizedBalance = normalizeBalance();

  return {
    id: value.id ? String(value.id) : makeId(),
    club: value.club ? String(value.club) : "",
    clubWeight: value.clubWeight != null ? String(value.clubWeight) : "",
    balancePoint: normalizedBalance.balancePoint,
    balanceUnit: normalizedBalance.balanceUnit,
    headWeight: value.headWeight != null ? String(value.headWeight) : "",
    shaftWeight: value.shaftWeight != null ? String(value.shaftWeight) : "",
    gripWeight: value.gripWeight != null ? String(value.gripWeight) : "",
    clubLength: value.clubLength != null ? String(value.clubLength) : "",
    targetSW: value.targetSW != null ? String(value.targetSW) : "",
    notes: value.notes != null ? String(value.notes) : "",
  };
}

function makeId(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
