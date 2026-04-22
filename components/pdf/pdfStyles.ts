import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  CRIMSON:      "#8b1a1a",   // primary — Nepali flag red
  CRIMSON_DARK: "#6b1414",
  SAFFRON:      "#c8973a",   // accent — used ≤ 3 times
  CREAM:        "#faf8f4",   // warm paper background
  WARM_WHITE:   "#f3ede3",   // card / alt-row fill
  INK:          "#1c1208",   // primary text
  MUTED:        "#6b5c45",   // secondary text
  BORDER:       "#d4c4a8",   // hairline rules
  WHITE:        "#ffffff",
};

export const styles = StyleSheet.create({
  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    fontFamily: "DM Sans",
    fontSize: 9,
    color: COLORS.INK,
    backgroundColor: COLORS.CREAM,
    paddingBottom: 46,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.CRIMSON,
    padding: "13 16",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, gap: 3 },
  headerLandlordName: {
    fontSize: 20,
    fontFamily: "Playfair Display",
    fontWeight: 700,
    color: COLORS.WHITE,
    letterSpacing: 0.4,
  },
  headerAddress: { fontSize: 8, color: "#e8c4c4" },
  headerRight: { alignItems: "flex-end", gap: 3 },
  headerTitle: {
    fontSize: 9,
    fontFamily: "DM Sans",
    fontWeight: 700,
    color: COLORS.SAFFRON,
    letterSpacing: 2.5,
  },
  headerInvoiceNum: { fontSize: 7.5, color: "#e8c4c4" },
  headerDate:       { fontSize: 7.5, color: "#e8c4c4" },

  // ── Billing period — typographic celebration ───────────────────────────────
  billingPeriodContainer: {
    padding: "10 16 9",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: COLORS.CREAM,
  },
  billingPeriodLabel: {
    fontSize: 6.5,
    color: COLORS.MUTED,
    letterSpacing: 2.5,
    marginBottom: 3,
  },
  billingPeriodValue: {
    fontSize: 22,
    fontFamily: "Playfair Display",
    fontStyle: "italic",
    color: COLORS.CRIMSON,
  },

  // ── Party cards ───────────────────────────────────────────────────────────
  partyRow: {
    flexDirection: "row",
    gap: 10,
    padding: "10 16 8",
  },
  partyCard: {
    flex: 1,
    padding: "8 10",
    borderRadius: 2,
  },
  partyCardFrom: {
    backgroundColor: COLORS.WARM_WHITE,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.BORDER,
  },
  partyCardTo: {
    backgroundColor: COLORS.CRIMSON,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.SAFFRON,
  },
  partyLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 4,
  },
  partyLabelFrom: { color: COLORS.MUTED },
  partyLabelTo:   { color: "#e8c4c4" },
  partyName: {
    fontSize: 11,
    fontFamily: "Playfair Display",
    fontWeight: 700,
    marginBottom: 2,
  },
  partyNameFrom: { color: COLORS.INK },
  partyNameTo:   { color: COLORS.WHITE },
  partyDetail:      { fontSize: 8 },
  partyDetailFrom:  { color: COLORS.MUTED },
  partyDetailTo:    { color: "#e8c4c4" },

  // ── Items table ───────────────────────────────────────────────────────────
  tableContainer: { padding: "0 16 8" },
  tableHeader: {
    flexDirection: "row",
    padding: "5 8",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.CRIMSON,
    backgroundColor: COLORS.WARM_WHITE,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.INK,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 8",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tableRowAlt:  { backgroundColor: COLORS.WARM_WHITE },
  tableRowElec: { backgroundColor: "#f5e6e6" },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },

  // ── Meter sub-row — subdued caption, no duplicated columns ────────────────
  subRow: {
    padding: "3 8 3 18",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    backgroundColor: "#fdf0f0",
  },
  subText: {
    fontSize: 7.5,
    color: COLORS.MUTED,
    fontStyle: "italic",
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    margin: "0 16",
  },

  // ── Grand total ───────────────────────────────────────────────────────────
  grandTotalRow: {
    flexDirection: "row",
    padding: "8 8",
    backgroundColor: COLORS.CRIMSON,
    margin: "0 16",
    borderRadius: 2,
  },
  grandTotalLabel: {
    flex: 3,
    color: COLORS.WHITE,
    fontSize: 10,
    fontFamily: "Playfair Display",
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  grandTotalAmount: {
    flex: 2,
    color: COLORS.SAFFRON,
    fontSize: 11,
    fontFamily: "Playfair Display",
    fontWeight: 700,
    textAlign: "right",
  },

  // ── Payment information ───────────────────────────────────────────────────
  notesContainer: {
    margin: "10 16 0",
    backgroundColor: COLORS.WARM_WHITE,
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  notesAccent:  { width: 3, backgroundColor: COLORS.MUTED },
  notesContent: { padding: "7 10", flex: 1, gap: 3 },
  notesTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.INK,
    letterSpacing: 1,
    marginBottom: 2,
  },
  notesText: { fontSize: 7.5, color: COLORS.MUTED },

  // ── Landlord notes ────────────────────────────────────────────────────────
  landlordNotesContainer: {
    margin: "8 16 0",
    backgroundColor: "#fef9ed",
    borderRadius: 2,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e8c97a",
  },
  landlordNotesAccent:  { width: 3, backgroundColor: COLORS.SAFFRON },
  landlordNotesContent: { padding: "7 10", flex: 1, gap: 3 },
  landlordNotesTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: COLORS.INK,
    letterSpacing: 1,
    marginBottom: 2,
  },
  landlordNoteItem: { fontSize: 7.5, color: COLORS.MUTED },

  // ── Signatures ────────────────────────────────────────────────────────────
  signaturesRow: {
    flexDirection: "row",
    margin: "18 16 0",
    gap: 20,
  },
  sigBlock: { flex: 1, alignItems: "center" },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    width: "100%",
    marginBottom: 4,
  },
  sigLabel: { fontSize: 7, color: COLORS.MUTED, letterSpacing: 0.5 },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    backgroundColor: COLORS.INK,
    padding: "6 16",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 6.5,
    color: "#8a7560",
    textAlign: "center",
    fontStyle: "italic",
  },
});
