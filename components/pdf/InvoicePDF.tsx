import { Document, Page, View, Text, Font } from "@react-pdf/renderer";
import { InvoiceData } from "@/lib/invoiceTypes";
import { styles, COLORS } from "./pdfStyles";

// ── Font registration ──────────────────────────────────────────────────────
Font.register({
  family: "Playfair Display",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2" },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2", fontWeight: 700 },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2", fontStyle: "italic" },
  ],
});

Font.register({
  family: "DM Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2" },
    { src: "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2", fontWeight: 700 },
  ],
});

// Prevent unwanted mid-word hyphenation in the invoice
Font.registerHyphenationCallback((word) => [word]);

// ── Helpers ───────────────────────────────────────────────────────────────
interface Props {
  data: InvoiceData;
}

function formatRs(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

// Newari lattice decorative band — used once, between header and billing period
function DecorativeBand() {
  const segments = [3, 0.6, 1.5, 0.6, 3, 0.6, 1.5, 0.6, 3, 0.6, 1.5, 0.6, 3];
  return (
    <View style={{ flexDirection: "row", height: 5 }}>
      {segments.map((flex, i) => (
        <View
          key={i}
          style={{ flex, backgroundColor: i % 2 === 0 ? COLORS.CRIMSON_DARK : COLORS.SAFFRON }}
        />
      ))}
    </View>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function InvoicePDF({ data }: Props) {
  const { landlord, invoice, invoiceNum, nepaliMonth, meters, totalUnits, totalElec, additionalCosts, grandTotal } = data;

  const lineItems: { label: string; amount: number; isElec?: boolean }[] = [
    { label: "House Rent", amount: invoice.rentCost },
    { label: "Electricity Charges", amount: totalElec, isElec: true },
    ...(invoice.serviceCharge > 0
      ? [{ label: "Service / Minimum Charge", amount: invoice.serviceCharge }]
      : []),
    ...additionalCosts.map((c) => ({ label: c.desc, amount: c.amount })),
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* 1. Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLandlordName}>{landlord.name}</Text>
            <Text style={styles.headerAddress}>{landlord.address}</Text>
            {landlord.contact ? (
              <Text style={styles.headerAddress}>{landlord.contact}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>RENTAL INVOICE</Text>
            <Text style={styles.headerInvoiceNum}>Invoice #: {invoiceNum}</Text>
            <Text style={styles.headerDate}>Date: {invoice.invoiceDate}</Text>
          </View>
        </View>

        {/* Newari lattice motif — used once */}
        <DecorativeBand />

        {/* 2. Billing Period — typographic celebration */}
        <View style={styles.billingPeriodContainer}>
          <Text style={styles.billingPeriodLabel}>BILLING PERIOD</Text>
          <Text style={styles.billingPeriodValue}>
            {nepaliMonth} {invoice.nepaliYear}
          </Text>
        </View>

        {/* 3. FROM / BILL TO */}
        <View style={styles.partyRow}>
          <View style={[styles.partyCard, styles.partyCardFrom]}>
            <Text style={[styles.partyLabel, styles.partyLabelFrom]}>FROM</Text>
            <Text style={[styles.partyName, styles.partyNameFrom]}>{landlord.name}</Text>
            <Text style={[styles.partyDetail, styles.partyDetailFrom]}>{landlord.address}</Text>
            {landlord.contact ? (
              <Text style={[styles.partyDetail, styles.partyDetailFrom]}>{landlord.contact}</Text>
            ) : null}
          </View>
          <View style={[styles.partyCard, styles.partyCardTo]}>
            <Text style={[styles.partyLabel, styles.partyLabelTo]}>BILL TO</Text>
            <Text style={[styles.partyName, styles.partyNameTo]}>{invoice.tenantName}</Text>
          </View>
        </View>

        {/* 4. Items Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>UNITS</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>AMOUNT</Text>
          </View>

          {lineItems.map((item, i) => (
            <View key={i}>
              <View
                style={[
                  styles.tableRow,
                  item.isElec ? styles.tableRowElec : i % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={styles.col1}>{item.label}</Text>
                <Text style={styles.col2}>
                  {item.isElec ? `${formatNum(totalUnits)} units` : ""}
                </Text>
                <Text style={styles.col3}>{formatRs(item.amount)}</Text>
              </View>

              {/* Meter sub-rows — subdued caption, no duplicate numbers */}
              {item.isElec &&
                meters.map((meter, j) => (
                  <View key={j} style={styles.subRow}>
                    <Text style={styles.subText}>
                      {meter.name}: {formatNum(meter.prev)} → {formatNum(meter.curr)} · {formatNum(meter.consumed)} units × Rs.{landlord.electricityRate} = {formatRs(meter.cost)}
                    </Text>
                  </View>
                ))}
            </View>
          ))}

          <View style={styles.divider} />
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
          <Text style={styles.grandTotalAmount}>{formatRs(grandTotal)}</Text>
        </View>

        {/* 5. Payment Information */}
        <View style={styles.notesContainer}>
          <View style={styles.notesAccent} />
          <View style={styles.notesContent}>
            <Text style={styles.notesTitle}>PAYMENT INFORMATION</Text>
            <Text style={styles.notesText}>
              • Payment is due by the {landlord.paymentDueDay}
              {landlord.paymentDueDay === 1
                ? "st"
                : landlord.paymentDueDay === 2
                ? "nd"
                : landlord.paymentDueDay === 3
                ? "rd"
                : "th"}{" "}
              of each month.
            </Text>
            <Text style={styles.notesText}>
              • Please include your unit number and invoice number with your payment.
            </Text>
            <Text style={styles.notesText}>
              • For queries, contact the landlord at {landlord.contact || landlord.address}.
            </Text>
          </View>
        </View>

        {/* 6. Landlord Notes */}
        {data.notes.length > 0 && (
          <View style={styles.landlordNotesContainer}>
            <View style={styles.landlordNotesAccent} />
            <View style={styles.landlordNotesContent}>
              <Text style={styles.landlordNotesTitle}>NOTES FROM LANDLORD</Text>
              {data.notes.map((note, i) => (
                <Text key={i} style={styles.landlordNoteItem}>• {note}</Text>
              ))}
            </View>
          </View>
        )}

        {/* 7. Signatures */}
        <View style={styles.signaturesRow}>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Tenant Signature</Text>
          </View>
          <View style={styles.sigBlock}>
            <View style={styles.sigLine} />
            <Text style={styles.sigLabel}>Landlord Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by AKS Rental Invoice System · {invoiceNum} · {invoice.invoiceDate}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
