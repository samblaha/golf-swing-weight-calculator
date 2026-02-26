import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { computeGaps, parseDistance } from "@/lib/gapping";
import type { BagProfile } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 3,
    color: "#475569",
    fontSize: 10,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontSize: 9,
  },
  accent: {
    marginTop: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#22c55e",
    width: 80,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  card: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  cardLabel: {
    color: "#64748b",
    fontSize: 9,
  },
  cardValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 700,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cell: {
    paddingRight: 6,
  },
  flagPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    fontSize: 8,
    marginRight: 4,
  },
  flagHole: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
  },
  flagOverlap: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    color: "#64748b",
    fontSize: 9,
  },
});

function makeChip(label: string) {
  return <Text style={styles.chip}>{label}</Text>;
}

function card(label: string, value: string) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function formatNumber(value: number | null, digits = 0): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

function flagBadge(flag: "overlap" | "hole") {
  const base = [styles.flagPill];
  if (flag === "hole") {
    return (
      <Text style={[...base, styles.flagHole]}>
        Hole
      </Text>
    );
  }
  return (
    <Text style={[...base, styles.flagOverlap]}>
      Overlap
    </Text>
  );
}

export function GappingReportDocument(args: { profile: BagProfile; generatedAt: number }) {
  const { profile } = args;
  const rows = profile.rows;
  const unitLabel = profile.unitSystem === "metric" ? "m" : "yd";

  const gapping = computeGaps(rows, profile.unitSystem);

  const carryValues = rows.map((row) => parseDistance(row.carryDistance)).filter((v): v is number => Number.isFinite(v));
  const longestCarry = carryValues.length ? Math.max(...carryValues) : null;
  const shortestCarry = carryValues.length ? Math.min(...carryValues) : null;

  const overlapCount = Object.values(gapping.byId).filter((m) => m.carryFlag === "overlap" || m.totalFlag === "overlap").length;
  const holeCount = Object.values(gapping.byId).filter((m) => m.carryFlag === "hole" || m.totalFlag === "hole").length;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Yardage Gapping Report</Text>
            <Text style={styles.subtitle}>{new Date(args.generatedAt).toLocaleString()}</Text>
          </View>
          <Text style={styles.subtitle}>
            Bag: {profile.name} • Clubs: {rows.length}
          </Text>
          <View style={styles.chipsRow}>
            {makeChip(`System: ${profile.unitSystem === "metric" ? "Metric" : "Imperial"}`)}
            {makeChip(`Units: ${unitLabel}`)}
            {makeChip("Overlap < 6")}
            {makeChip("Hole > 20")}
          </View>
          <View style={styles.accent} />
        </View>

        <View style={styles.cardsRow}>
          {card("Longest carry", longestCarry === null ? "-" : `${formatNumber(longestCarry)} ${unitLabel}`)}
          {card("Shortest carry", shortestCarry === null ? "-" : `${formatNumber(shortestCarry)} ${unitLabel}`)}
          {card("Overlaps flagged", String(overlapCount))}
          {card("Holes flagged", String(holeCount))}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { width: 86 }]}>Club</Text>
            <Text style={[styles.cell, { width: 54 }]}>Carry</Text>
            <Text style={[styles.cell, { width: 54 }]}>Total</Text>
            <Text style={[styles.cell, { width: 52 }]}>Gap C</Text>
            <Text style={[styles.cell, { width: 52 }]}>Gap T</Text>
            <Text style={[styles.cell, { width: 70 }]}>Flags</Text>
            <Text style={[styles.cell, { flexGrow: 1 }]}>Suggestion</Text>
          </View>

          {rows.map((row) => {
            const m = gapping.byId[row.id];
            const flags = [m?.carryFlag, m?.totalFlag].filter(Boolean) as Array<"overlap" | "hole">;

            return (
              <View key={row.id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: 86 }]}>{row.club || "-"}</Text>
                <Text style={[styles.cell, { width: 54 }]}>{row.carryDistance ? `${row.carryDistance}` : "-"}</Text>
                <Text style={[styles.cell, { width: 54 }]}>{row.totalDistance ? `${row.totalDistance}` : "-"}</Text>
                <Text style={[styles.cell, { width: 52 }]}>{formatNumber(m?.carryGap ?? null, 0)}</Text>
                <Text style={[styles.cell, { width: 52 }]}>{formatNumber(m?.totalGap ?? null, 0)}</Text>
                <View style={[styles.cell, { width: 70, flexDirection: "row", flexWrap: "wrap" }]}>
                  {flags.length ? flags.map((flag, idx) => <View key={`${flag}-${idx}`}>{flagBadge(flag)}</View>) : <Text style={{ color: "#64748b" }}>-</Text>}
                </View>
                <Text style={[styles.cell, { flexGrow: 1, color: "#334155" }]}>{m?.suggestion ?? "-"}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          Tip: Use carry for gapping decisions; total can vary by turf and conditions. Keep this report with your bag spec sheet.
        </Text>
      </Page>
    </Document>
  );
}

