import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  NAVY: "#0f3460",
  BLUE: "#2980b9",
  SLATE: "#2c3e50",
  LBLUE: "#d6eaf8",
  ALTROW: "#f5f8fa",
  DTXT: "#1c2833",
  MTXT: "#646e78",
  WHITE: "#ffffff",
  SUBTOTAL: "#edf3fa",
  TOTAL_BG: "#1a3a5c",
  FOOTER_BG: "#2c3e50",
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.DTXT,
    paddingBottom: 40,
  },
  // Header
  header: {
    backgroundColor: COLORS.NAVY,
    padding: "12 14",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    color: COLORS.WHITE,
    gap: 2,
  },
  headerLandlordName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLORS.WHITE,
  },
  headerAddress: {
    fontSize: 8,
    color: "#a8c4e0",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLORS.WHITE,
    letterSpacing: 1,
  },
  headerInvoiceNum: {
    fontSize: 8,
    color: "#a8c4e0",
  },
  headerDate: {
    fontSize: 8,
    color: "#a8c4e0",
  },
  // Billing strip
  billingStrip: {
    backgroundColor: COLORS.BLUE,
    padding: "6 14",
    alignItems: "center",
  },
  billingStripText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.WHITE,
    letterSpacing: 0.5,
  },
  // Party cards
  partyRow: {
    flexDirection: "row",
    gap: 10,
    padding: "10 14 8",
  },
  partyCard: {
    flex: 1,
    padding: "8 10",
    borderRadius: 4,
  },
  partyCardFrom: {
    backgroundColor: COLORS.LBLUE,
  },
  partyCardTo: {
    backgroundColor: COLORS.NAVY,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyLabelFrom: {
    color: COLORS.BLUE,
  },
  partyLabelTo: {
    color: "#a8c4e0",
  },
  partyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  partyNameFrom: {
    color: COLORS.SLATE,
  },
  partyNameTo: {
    color: COLORS.WHITE,
  },
  partyDetail: {
    fontSize: 8,
  },
  partyDetailFrom: {
    color: COLORS.MTXT,
  },
  partyDetailTo: {
    color: "#a8c4e0",
  },
  // Items table
  tableContainer: {
    padding: "0 14 10",
  },
  tableHeader: {
    backgroundColor: COLORS.SLATE,
    flexDirection: "row",
    padding: "5 8",
  },
  tableHeaderText: {
    color: COLORS.WHITE,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: "5 8",
  },
  tableRowAlt: {
    backgroundColor: COLORS.ALTROW,
  },
  tableRowElec: {
    backgroundColor: COLORS.LBLUE,
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  // Sub-row (meter detail)
  subRow: {
    flexDirection: "row",
    padding: "3 8 3 20",
    backgroundColor: COLORS.SUBTOTAL,
  },
  subText: {
    fontSize: 8,
    color: COLORS.MTXT,
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.BLUE,
    margin: "2 14",
  },
  // Grand total row
  grandTotalRow: {
    flexDirection: "row",
    padding: "7 8",
    backgroundColor: COLORS.TOTAL_BG,
    margin: "0 14",
    borderRadius: 2,
  },
  grandTotalLabel: {
    flex: 3,
    color: COLORS.WHITE,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalAmount: {
    flex: 2,
    color: COLORS.WHITE,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  // Payment notes
  notesContainer: {
    margin: "10 14 0",
    backgroundColor: COLORS.LBLUE,
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  notesAccent: {
    width: 4,
    backgroundColor: COLORS.BLUE,
  },
  notesContent: {
    padding: "8 10",
    flex: 1,
    gap: 3,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.SLATE,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8,
    color: COLORS.MTXT,
  },
  // Landlord notes
  landlordNotesContainer: {
    margin: "8 14 0",
    backgroundColor: "#fef9e7",
    borderRadius: 4,
    flexDirection: "row",
    overflow: "hidden",
  },
  landlordNotesAccent: {
    width: 4,
    backgroundColor: "#f39c12",
  },
  landlordNotesContent: {
    padding: "8 10",
    flex: 1,
    gap: 3,
  },
  landlordNotesTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.SLATE,
    marginBottom: 2,
  },
  landlordNoteItem: {
    fontSize: 8,
    color: COLORS.MTXT,
  },
  // Signatures
  signaturesRow: {
    flexDirection: "row",
    margin: "16 14 0",
    gap: 20,
  },
  sigBlock: {
    flex: 1,
    alignItems: "center",
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: COLORS.SLATE,
    width: "100%",
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 8,
    color: COLORS.MTXT,
  },
  // Footer
  footer: {
    backgroundColor: COLORS.FOOTER_BG,
    padding: "6 14",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerText: {
    fontSize: 7,
    color: "#a0aab4",
    textAlign: "center",
    fontFamily: "Helvetica-Oblique",
  },
});
