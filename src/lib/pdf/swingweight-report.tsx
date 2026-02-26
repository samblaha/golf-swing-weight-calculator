import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { averageOrDash, computeMetrics, formatNullable, formatSignedNullable } from "@/lib/swingweight";
import type { BagProfile, ClubRow } from "@/types";

type ReportRow = {
  row: ClubRow;
  metrics: ReturnType<typeof computeMetrics>;
};

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
    backgroundColor: "#0ea5e9",
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
  muted: {
    color: "#64748b",
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

function tableHeaderCells(mode: BagProfile["calculatorMode"]) {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.cell, { width: 78 }]}>Club</Text>
      {mode === "basic" ? (
        <>
          <Text style={[styles.cell, { width: 66 }]}>Weight</Text>
          <Text style={[styles.cell, { width: 66 }]}>Balance</Text>
        </>
      ) : (
        <>
          <Text style={[styles.cell, { width: 56 }]}>Head</Text>
          <Text style={[styles.cell, { width: 56 }]}>Shaft</Text>
          <Text style={[styles.cell, { width: 56 }]}>Grip</Text>
          <Text style={[styles.cell, { width: 56 }]}>Length</Text>
        </>
      )}
      <Text style={[styles.cell, { width: 48 }]}>Cur SW</Text>
      <Text style={[styles.cell, { width: 44 }]}>Grade</Text>
      <Text style={[styles.cell, { width: 44 }]}>Target</Text>
      <Text style={[styles.cell, { width: 54 }]}>Pts</Text>
      <Text style={[styles.cell, { width: 54 }]}>Head g</Text>
      <Text style={[styles.cell, { width: 54 }]}>Grip g</Text>
      <Text style={[styles.cell, { width: 56 }]}>Len in</Text>
    </View>
  );
}

function tableRowCells(item: ReportRow, mode: BagProfile["calculatorMode"], unitSystem: BagProfile["unitSystem"]) {
  const { row, metrics } = item;
  const weightUnit = unitSystem === "metric" ? "g" : "oz";
  const balanceUnit = unitSystem === "metric" ? "cm" : "in";
  const lengthUnit = unitSystem === "metric" ? "cm" : "in";

  return (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, { width: 78 }]}>{row.club || "-"}</Text>

      {mode === "basic" ? (
        <>
          <Text style={[styles.cell, { width: 66 }]}>{row.clubWeight ? `${row.clubWeight} ${weightUnit}` : "-"}</Text>
          <Text style={[styles.cell, { width: 66 }]}>
            {row.balancePoint ? `${row.balancePoint} ${row.balanceUnit === "cm" ? "cm" : balanceUnit}` : "-"}
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.cell, { width: 56 }]}>{row.headWeight ? `${row.headWeight} ${weightUnit}` : "-"}</Text>
          <Text style={[styles.cell, { width: 56 }]}>{row.shaftWeight ? `${row.shaftWeight} ${weightUnit}` : "-"}</Text>
          <Text style={[styles.cell, { width: 56 }]}>{row.gripWeight ? `${row.gripWeight} ${weightUnit}` : "-"}</Text>
          <Text style={[styles.cell, { width: 56 }]}>{row.clubLength ? `${row.clubLength} ${lengthUnit}` : "-"}</Text>
        </>
      )}

      <Text style={[styles.cell, { width: 48 }]}>{metrics.currentSWLabel ?? (metrics.currentOutOfRange ? "Out" : "-")}</Text>
      <Text style={[styles.cell, { width: 44 }]}>{metrics.swingWeightGrade ?? "-"}</Text>
      <Text style={[styles.cell, { width: 44 }]}>{row.targetSW || "-"}</Text>
      <Text style={[styles.cell, { width: 54 }]}>{formatSignedNullable(metrics.deltaPoints, 1)}</Text>
      <Text style={[styles.cell, { width: 54 }]}>{formatSignedNullable(metrics.headAdjustment, 1)}</Text>
      <Text style={[styles.cell, { width: 54 }]}>{formatSignedNullable(metrics.gripAdjustment, 1)}</Text>
      <Text style={[styles.cell, { width: 56 }]}>{formatSignedNullable(metrics.lengthAdjustment, 1)}</Text>
    </View>
  );
}

export function SwingweightReportDocument(args: { profile: BagProfile; generatedAt: number }) {
  const { profile } = args;
  const rows = profile.rows;
  const computed: ReportRow[] = rows.map((row) => ({
    row,
    metrics: computeMetrics(row, profile.calculatorMode, profile.unitSystem),
  }));

  const validPoints = computed.map((item) => item.metrics.currentPoints).filter((v): v is number => Number.isFinite(v));
  const validInchGrams = computed.map((item) => item.metrics.inchGrams).filter((v): v is number => Number.isFinite(v));
  const rowsWithSw = validPoints.length;

  const weightUnit = profile.unitSystem === "metric" ? "g" : "oz";
  const balanceUnit = profile.unitSystem === "metric" ? "cm" : "in";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Swingweight Report</Text>
            <Text style={styles.subtitle}>{new Date(args.generatedAt).toLocaleString()}</Text>
          </View>
          <Text style={styles.subtitle}>
            Bag: {profile.name} • Clubs: {rows.length}
          </Text>
          <View style={styles.chipsRow}>
            {makeChip(`Mode: ${profile.calculatorMode === "basic" ? "Basic" : "Components"}`)}
            {makeChip(`System: ${profile.unitSystem === "metric" ? "Metric" : "Imperial"}`)}
            {makeChip(`Weight: ${weightUnit}`)}
            {makeChip(`Balance: ${balanceUnit}`)}
          </View>
          <View style={styles.accent} />
        </View>

        <View style={styles.cardsRow}>
          {card("Avg points", averageOrDash(validPoints, 1))}
          {card("Avg inch-grams", formatNullable(validInchGrams.length ? validInchGrams.reduce((a, b) => a + b, 0) / validInchGrams.length : null, 0))}
          {card("Rows with SW", String(rowsWithSw))}
          {card("Out of range", String(computed.filter((item) => item.metrics.currentOutOfRange).length))}
        </View>

        <View style={styles.table}>
          {tableHeaderCells(profile.calculatorMode)}
          {computed.map((item) => tableRowCells(item, profile.calculatorMode, profile.unitSystem))}
        </View>

        <Text style={styles.footer}>
          Notes: This report uses the same formulas as the app. Positive head grams mean add head weight. Negative grip grams mean use a lighter grip.
        </Text>
      </Page>
    </Document>
  );
}

