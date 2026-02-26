import { describe, expect, it } from "vitest";

import { computeGaps, parseDistance } from "@/lib/gapping";
import type { ClubRow } from "@/types";

function makeRow(partial: Partial<ClubRow> & Pick<ClubRow, "id" | "club">): ClubRow {
  return {
    id: partial.id,
    club: partial.club,
    clubWeight: "",
    balancePoint: "",
    balanceUnit: "in",
    headWeight: "",
    shaftWeight: "",
    gripWeight: "",
    clubLength: "",
    carryDistance: "",
    totalDistance: "",
    targetSW: "",
    notes: "",
    ...partial,
  };
}

describe("parseDistance", () => {
  it("parses empty as null", () => {
    expect(parseDistance("")).toBeNull();
    expect(parseDistance("   ")).toBeNull();
  });

  it("parses numbers and commas", () => {
    expect(parseDistance("150")).toBe(150);
    expect(parseDistance("150.5")).toBe(150.5);
    expect(parseDistance("1,234")).toBe(1234);
  });

  it("rejects invalid values", () => {
    expect(parseDistance("nope")).toBeNull();
    expect(parseDistance("-10")).toBeNull();
  });
});

describe("computeGaps", () => {
  it("computes carry and total gaps in distance order", () => {
    const rows: ClubRow[] = [
      makeRow({ id: "d", club: "Driver", carryDistance: "250", totalDistance: "270" }),
      makeRow({ id: "w", club: "3W", carryDistance: "235", totalDistance: "255" }),
      makeRow({ id: "i", club: "5i", carryDistance: "180", totalDistance: "190" }),
    ];

    const result = computeGaps(rows, "imperial");

    expect(result.byId.d.carryGap).toBeNull();
    expect(result.byId.w.carryGap).toBe(15);
    expect(result.byId.i.carryGap).toBe(55);
    expect(result.byId.i.carryFlag).toBe("hole");
    expect(result.byId.i.suggestion).toContain("Hole between 3W and 5i");

    expect(result.byId.w.totalGap).toBe(15);
    expect(result.byId.i.totalGap).toBe(65);
    expect(result.byId.i.totalFlag).toBe("hole");
  });

  it("flags overlap gaps", () => {
    const rows: ClubRow[] = [
      makeRow({ id: "nine", club: "9i", carryDistance: "135", totalDistance: "145" }),
      makeRow({ id: "pw", club: "PW", carryDistance: "132", totalDistance: "143" }),
    ];

    const result = computeGaps(rows, "imperial");

    expect(result.byId.pw.carryGap).toBe(3);
    expect(result.byId.pw.carryFlag).toBe("overlap");
    expect(result.byId.pw.suggestion).toContain("Overlap between 9i and PW");
  });
});

