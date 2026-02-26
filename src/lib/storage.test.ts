import { describe, expect, it } from "vitest";

import { sortClubRows } from "@/lib/storage";
import type { ClubRow } from "@/types";

function makeRow(club: string, id: string): ClubRow {
  return {
    id,
    club,
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
  };
}

describe("sortClubRows", () => {
  it("orders known clubs from driver to putter", () => {
    const rows = [
      makeRow("Putter", "1"),
      makeRow("7i", "2"),
      makeRow("Driver", "3"),
      makeRow("3W", "4"),
      makeRow("PW", "5"),
    ];

    const sorted = sortClubRows(rows);

    expect(sorted.map((row) => row.club)).toEqual(["Driver", "3W", "7i", "PW", "Putter"]);
  });

  it("puts unknown clubs after known clubs and alphabetizes them", () => {
    const rows = [
      makeRow("Chipper", "1"),
      makeRow("7i", "2"),
      makeRow("Driving Iron", "3"),
      makeRow("Putter", "4"),
      makeRow("2 Hybrid", "5"),
    ];

    const sorted = sortClubRows(rows);

    expect(sorted.map((row) => row.club)).toEqual(["2 Hybrid", "7i", "Putter", "Chipper", "Driving Iron"]);
  });

  it("matches known clubs with mixed case and spacing", () => {
    const rows = [makeRow("  sand wedge ", "1"), makeRow("  dRiVer  ", "2"), makeRow("5 Iron", "3")];

    const sorted = sortClubRows(rows);

    expect(sorted.map((row) => row.club)).toEqual(["  dRiVer  ", "5 Iron", "  sand wedge "]);
  });

  it("matches additional shorthand aliases like DR, HY, and PT", () => {
    const rows = [makeRow("pt", "1"), makeRow("3 hy", "2"), makeRow("dr", "3"), makeRow("7i", "4")];

    const sorted = sortClubRows(rows);

    expect(sorted.map((row) => row.club)).toEqual(["dr", "3 hy", "7i", "pt"]);
  });
});
