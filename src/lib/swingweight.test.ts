import { describe, expect, it } from "vitest";

import { computeMetrics, swingweightFromInchGrams } from "@/lib/swingweight";
import type { ClubRow } from "@/types";

function makeRow(partial: Partial<ClubRow>): ClubRow {
  return {
    id: "row-1",
    club: "5i",
    clubWeight: "",
    balancePoint: "",
    balanceUnit: "in",
    headWeight: "",
    shaftWeight: "",
    gripWeight: "",
    clubLength: "",
    targetSW: "",
    notes: "",
    ...partial,
  };
}

describe("swingweight math", () => {
  it("maps 4550 inch-grams to A 0.0", () => {
    const row = makeRow({ clubWeight: "455", balancePoint: "24.0", balanceUnit: "in" });
    const metrics = computeMetrics(row);

    expect(metrics.inchGrams).toBe(4550);
    expect(metrics.currentSWLabel).toBe("A 0.0");
    expect(metrics.currentPoints).toBe(0);
  });

  it("maps a D range value to D 5.0", () => {
    const result = swingweightFromInchGrams(6300);

    expect(result.outOfRange).toBe(false);
    expect(result.label).toBe("D 5.0");
    expect(result.points).toBe(35);
  });

  it("computes adjustment deltas from current to target", () => {
    const row = makeRow({
      clubWeight: "455",
      balancePoint: "24.0",
      balanceUnit: "in",
      targetSW: "B0",
    });

    const metrics = computeMetrics(row);

    expect(metrics.deltaPoints).toBe(10);
    expect(metrics.headAdjustment).toBe(20);
    expect(metrics.gripAdjustment).toBe(-40);
    expect(metrics.lengthAdjustment).toBe(1.7);
  });

  it("flags out-of-range inch-grams", () => {
    const result = swingweightFromInchGrams(8200);

    expect(result.outOfRange).toBe(true);
    expect(result.label).toBeNull();
    expect(result.points).toBeNull();
  });

  it("computes component mode metrics", () => {
    const row = makeRow({
      headWeight: "200",
      shaftWeight: "65",
      gripWeight: "50",
      clubLength: "112",
      targetSW: "D2",
    });

    const metrics = computeMetrics(row, "components", "metric");

    expect(metrics.componentTotalWeight).toBe(315);
    expect(metrics.clubLengthInches).toBeCloseTo(44.1, 1);
    expect(metrics.currentSWLabel).not.toBeNull();
    expect(metrics.lorythmicScale).not.toBeNull();
    expect(metrics.officialScale).not.toBeNull();
  });

  it("converts imperial basic inputs", () => {
    const row = makeRow({
      clubWeight: "11.5",
      balancePoint: "29",
      balanceUnit: "in",
    });

    const metrics = computeMetrics(row, "basic", "imperial");

    expect(metrics.inchGrams).toBe(4890);
    expect(metrics.currentOutOfRange).toBe(false);
    expect(metrics.currentSWLabel).toBe("A 6.8");
  });
});
