import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Info } from "lucide-react";

import { HowToDialog } from "@/components/how-to-dialog";
import { EducationalSection } from "@/components/educational-section";
import { ProfileToolbar } from "@/components/profile-toolbar";
import { SheetTable } from "@/components/sheet-table";
import { SummaryCards } from "@/components/summary-cards";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { createBlankRow, createDefaultRows, createProfile, loadState, saveState } from "@/lib/storage";
import { averageOrDash, computeMetrics } from "@/lib/swingweight";
import type { AppState, BagProfile, BalanceUnit, CalculatorMode, ClubRow, UnitSystem } from "@/types";

const HOW_TO_SEEN_STORAGE_KEY = "swingweight-bag-lab-howto-seen-v1";

function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [howToOpen, setHowToOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const seen = window.localStorage.getItem(HOW_TO_SEEN_STORAGE_KEY) === "1";
    return !seen;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeProfile = useMemo(
    () => state.profiles.find((profile) => profile.id === state.activeProfileId) ?? null,
    [state.activeProfileId, state.profiles],
  );

  const metrics = useMemo(
    () =>
      activeProfile
        ? activeProfile.rows.map((row) => computeMetrics(row, activeProfile.calculatorMode, activeProfile.unitSystem))
        : [],
    [activeProfile],
  );

  const validCurrentPoints = metrics
    .map((item) => item.currentPoints)
    .filter((item): item is number => Number.isFinite(item));

  const validInchGrams = metrics
    .map((item) => item.inchGrams)
    .filter((item): item is number => Number.isFinite(item));

  const lastSavedLabel = activeProfile ? new Date(activeProfile.updatedAt).toLocaleString() : "Never";

  const setProfileRows = (updater: (rows: ClubRow[]) => ClubRow[]) => {
    setState((prev) => {
      const profile = prev.profiles.find((item) => item.id === prev.activeProfileId);
      if (!profile) {
        return prev;
      }

      const nextProfile: BagProfile = {
        ...profile,
        rows: updater(profile.rows),
        updatedAt: Date.now(),
      };

      return {
        ...prev,
        profiles: prev.profiles.map((item) => (item.id === nextProfile.id ? nextProfile : item)),
      };
    });
  };

  const setActiveProfile = (updater: (profile: BagProfile) => BagProfile) => {
    setState((prev) => {
      const profile = prev.profiles.find((item) => item.id === prev.activeProfileId);
      if (!profile) {
        return prev;
      }

      const nextProfile = updater(profile);
      return {
        ...prev,
        profiles: prev.profiles.map((item) => (item.id === nextProfile.id ? nextProfile : item)),
      };
    });
  };

  const handleSelectProfile = (profileId: string) => {
    setState((prev) => ({ ...prev, activeProfileId: profileId }));
  };

  const handleCreateProfile = (name: string) => {
    const profile = createProfile(name);
    setState((prev) => ({
      profiles: [...prev.profiles, profile],
      activeProfileId: profile.id,
    }));
  };

  const handleRenameProfile = (name: string) => {
    setState((prev) => {
      const profile = prev.profiles.find((item) => item.id === prev.activeProfileId);
      if (!profile) {
        return prev;
      }

      const nextProfile: BagProfile = {
        ...profile,
        name,
        updatedAt: Date.now(),
      };

      return {
        ...prev,
        profiles: prev.profiles.map((item) => (item.id === nextProfile.id ? nextProfile : item)),
      };
    });
  };

  const handleDeleteProfile = () => {
    if (state.profiles.length <= 1) {
      window.alert("At least one bag profile is required.");
      return;
    }

    const profile = state.profiles.find((item) => item.id === state.activeProfileId);
    if (!profile) {
      return;
    }

    const confirmed = window.confirm(`Delete "${profile.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setState((prev) => {
      const remaining = prev.profiles.filter((item) => item.id !== prev.activeProfileId);
      return {
        profiles: remaining,
        activeProfileId: remaining[0].id,
      };
    });
  };

  const handleResetTemplate = () => {
    const confirmed = window.confirm("Reset this bag to the default club template?");
    if (!confirmed) {
      return;
    }

    setProfileRows(() => createDefaultRows());
  };

  const handleAddClub = () => {
    setProfileRows((rows) => {
      const unit: BalanceUnit = rows[0]?.balanceUnit ?? "in";
      return [...rows, { ...createBlankRow(), balanceUnit: unit }];
    });
  };

  const handleRowChange = (rowId: string, field: keyof ClubRow, value: string) => {
    setProfileRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const formatNumberForInput = (value: number, digits = 2) => {
    const fixed = value.toFixed(digits);
    return fixed.replace(/\.?0+$/, "");
  };

  const convertBalancePoint = (raw: string, fromUnit: BalanceUnit, toUnit: BalanceUnit) => {
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || fromUnit === toUnit) {
      return raw;
    }

    const converted = fromUnit === "in" ? parsed * 2.54 : parsed / 2.54;
    return formatNumberForInput(converted, 2);
  };

  const handleBalanceUnitChange = (nextUnit: BalanceUnit) => {
    setProfileRows((rows) =>
      rows.map((row) => {
        if (row.balanceUnit === nextUnit) {
          return row;
        }

        return {
          ...row,
          balanceUnit: nextUnit,
          balancePoint: convertBalancePoint(row.balancePoint, row.balanceUnit, nextUnit),
        };
      }),
    );
  };

  const handleRemoveRow = (rowId: string) => {
    setProfileRows((rows) => rows.filter((row) => row.id !== rowId));
  };

  const convertWeight = (raw: string, from: UnitSystem, to: UnitSystem) => {
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || from === to) {
      return raw;
    }
    const converted = from === "metric" ? parsed / 28.349523125 : parsed * 28.349523125;
    return formatNumberForInput(converted, 2);
  };

  const convertLength = (raw: string, from: UnitSystem, to: UnitSystem) => {
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed) || from === to) {
      return raw;
    }
    const converted = from === "metric" ? parsed / 2.54 : parsed * 2.54;
    return formatNumberForInput(converted, 2);
  };

  const handleCalculatorModeChange = (nextMode: CalculatorMode) => {
    setActiveProfile((profile) => ({
      ...profile,
      calculatorMode: nextMode,
      updatedAt: Date.now(),
    }));
  };

  const handleUnitSystemChange = (nextSystem: UnitSystem) => {
    setActiveProfile((profile) => {
      if (profile.unitSystem === nextSystem) {
        return profile;
      }

      const nextBalanceUnit: BalanceUnit = nextSystem === "metric" ? "cm" : "in";
      return {
        ...profile,
        unitSystem: nextSystem,
        rows: profile.rows.map((row) => ({
          ...row,
          clubWeight: convertWeight(row.clubWeight, profile.unitSystem, nextSystem),
          headWeight: convertWeight(row.headWeight, profile.unitSystem, nextSystem),
          shaftWeight: convertWeight(row.shaftWeight, profile.unitSystem, nextSystem),
          gripWeight: convertWeight(row.gripWeight, profile.unitSystem, nextSystem),
          clubLength: convertLength(row.clubLength, profile.unitSystem, nextSystem),
          balancePoint: convertBalancePoint(row.balancePoint, row.balanceUnit, nextBalanceUnit),
          balanceUnit: nextBalanceUnit,
        })),
        updatedAt: Date.now(),
      };
    });
  };

  const acknowledgeHowTo = () => {
    try {
      window.localStorage.setItem(HOW_TO_SEEN_STORAGE_KEY, "1");
    } catch {
      // no-op
    }
  };

  if (!activeProfile) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">No bag profile found.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-4 py-6 md:px-6">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Golf Bag Builder</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">SwingWeight Bag Lab</h1>
          <div className="flex max-w-4xl items-start gap-2 text-sm text-muted-foreground">
            <p>Enter weight + balance point to get swingweight and adjustment targets.</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="mt-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="How calculations work"
                >
                  <Info className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="max-w-sm space-y-1">
                <p className="font-medium">Method</p>
                <p>Balance point is measured from the grip end.</p>
                <p>
                  Inch-grams = (balance<sub>in</sub> − 14) × weight<sub>g</sub>
                </p>
                <p>Swingweight maps 4550–8049 inch-grams to A0–G9.</p>
              </TooltipContent>
            </Tooltip>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="mt-0.5 text-muted-foreground hover:text-foreground"
              aria-label="How to measure balance point"
              onClick={() => setHowToOpen(true)}
            >
              <HelpCircle className="size-3.5" />
            </Button>
          </div>
        </header>

        <HowToDialog
          open={howToOpen}
          onOpenChange={(open) => {
            setHowToOpen(open);
            if (!open) {
              acknowledgeHowTo();
            }
          }}
          onAcknowledge={acknowledgeHowTo}
        />

        <SummaryCards
          clubCount={activeProfile.rows.length}
          averagePoints={averageOrDash(validCurrentPoints, 1)}
          averageInchGrams={averageOrDash(validInchGrams, 0)}
          rowsWithSwingweight={validCurrentPoints.length}
        />

        <EducationalSection />

        <ProfileToolbar
          profiles={state.profiles.map((profile) => ({ id: profile.id, name: profile.name }))}
          activeProfileId={state.activeProfileId}
          lastSavedLabel={lastSavedLabel}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onRenameProfile={handleRenameProfile}
          onDeleteProfile={handleDeleteProfile}
          onResetTemplate={handleResetTemplate}
          onAddClub={handleAddClub}
        />

        <SheetTable
          rows={activeProfile.rows}
          calculatorMode={activeProfile.calculatorMode}
          unitSystem={activeProfile.unitSystem}
          balanceUnit={activeProfile.rows[0]?.balanceUnit ?? "in"}
          onCalculatorModeChange={handleCalculatorModeChange}
          onUnitSystemChange={handleUnitSystemChange}
          onBalanceUnitChange={handleBalanceUnitChange}
          onAddClub={handleAddClub}
          onResetTemplate={handleResetTemplate}
          onRowChange={handleRowChange}
          onRemoveRow={handleRemoveRow}
        />

        <footer className="rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground">
          Positive head grams mean add head weight. Negative grip grams mean use a lighter grip.
        </footer>
      </div>
    </main>
  );
}

export default App;
