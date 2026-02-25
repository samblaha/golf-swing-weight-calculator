import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SwingWeightLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G";

const LETTERS: SwingWeightLetter[] = ["A", "B", "C", "D", "E", "F", "G"];
const DIGITS = Array.from({ length: 10 }, (_, index) => String(index));
const COMMON_TARGETS = ["D2", "D3", "D4", "D5"];

function isSwingWeightLetter(value: string): value is SwingWeightLetter {
  return (LETTERS as string[]).includes(value);
}

function matchableTargetFromCurrentLabel(label: string | null): string | null {
  if (!label) {
    return null;
  }

  const match = /^([A-G])\s+(\d)\.0$/.exec(label);
  if (!match) {
    return null;
  }

  const letter = match[1];
  const digit = match[2];
  if (!letter || !digit || !isSwingWeightLetter(letter)) {
    return null;
  }

  return `${letter}${digit}`;
}

interface TargetSwPickerProps {
  value: string;
  currentSWLabel: string | null;
  onChange: (next: string) => void;
}

export function TargetSwPicker({ value, currentSWLabel, onChange }: TargetSwPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<SwingWeightLetter>(() => {
    const next = value?.trim();
    const first = next ? next.slice(0, 1).toUpperCase() : "";
    return isSwingWeightLetter(first) ? first : "D";
  });

  const matchCurrentTarget = useMemo(() => matchableTargetFromCurrentLabel(currentSWLabel), [currentSWLabel]);
  const valueLetter = useMemo(() => {
    const trimmed = value?.trim();
    const first = trimmed ? trimmed.slice(0, 1).toUpperCase() : "";
    return isSwingWeightLetter(first) ? first : null;
  }, [value]);
  const effectiveLetter = valueLetter ?? activeLetter;

  const setTarget = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const displayValue = value?.trim() ? value : "—";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-[110px] justify-between gap-2 font-mono tabular-nums"
          aria-label="Target swingweight"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>{displayValue}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[270px] p-2">
        <div className="flex flex-wrap gap-1.5">
          <Button type="button" size="xs" variant="secondary" onClick={() => setTarget("")}>
            None
          </Button>
          {matchCurrentTarget ? (
            <Button type="button" size="xs" variant="secondary" onClick={() => setTarget(matchCurrentTarget)}>
              Match {matchCurrentTarget}
            </Button>
          ) : null}
          {COMMON_TARGETS.map((target) => (
            <Button
              key={target}
              type="button"
              size="xs"
              variant={value === target ? "secondary" : "outline"}
              onClick={() => setTarget(target)}
              className="font-mono"
            >
              {target}
            </Button>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
            {LETTERS.map((letter) => (
              <Button
                key={letter}
                type="button"
                size="xs"
                variant={effectiveLetter === letter ? "secondary" : "ghost"}
                aria-pressed={effectiveLetter === letter}
                onClick={() => setActiveLetter(letter)}
                className="w-7 font-mono"
              >
                {letter}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {DIGITS.map((digit) => {
            const next = `${effectiveLetter}${digit}`;
            const isSelected = value === next;

            return (
              <Button
                key={digit}
                type="button"
                size="xs"
                variant={isSelected ? "secondary" : "ghost"}
                aria-pressed={isSelected}
                onClick={() => setTarget(next)}
                className="h-8 font-mono tabular-nums"
              >
                {digit}
              </Button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

