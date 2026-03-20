import { Document, Page, View, Text } from "@react-pdf/renderer";
import { InvoiceData } from "@/lib/invoiceTypes";
import { styles, COLORS } from "./pdfStyles";

interface Props {
  data: InvoiceData;
}

function formatRs(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
        {/* 1. Header Banner */}
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

        {/* 2. Billing Period Strip */}
        <View style={styles.billingStrip}>
          <Text style={styles.billingStripText}>
            BILLING PERIOD: {nepaliMonth} {invoice.nepaliYear}
          </Text>
        </View>

        {/* 3. FROM / BILL TO Cards */}
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
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Units</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Amount</Text>
          </View>

          {lineItems.map((item, i) => (
            <View key={i}>
              <View
                style={[
                  styles.tableRow,
                  item.isElec ? styles.tableRowElec : i % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={[styles.col1]}>{item.label}</Text>
                <Text style={[styles.col2]}>
                  {item.isElec ? `${totalUnits} units` : ""}
                </Text>
                <Text style={[styles.col3]}>{formatRs(item.amount)}</Text>
              </View>

              {/* Meter sub-rows */}
              {item.isElec &&
                meters.map((meter, j) => (
                  <View key={j} style={styles.subRow}>
                    <Text style={[styles.subText, styles.col1]}>
                      {meter.name}: {meter.prev} → {meter.curr} ({meter.consumed} units @ Rs.{landlord.electricityRate}/unit)
                    </Text>
                    <Text style={[styles.subText, styles.col2]}>{meter.consumed}</Text>
                    <Text style={[styles.subText, styles.col3]}>{formatRs(meter.cost)}</Text>
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

        {/* 5. Payment Notes */}
        <View style={styles.notesContainer}>
          <View style={styles.notesAccent} />
          <View style={styles.notesContent}>
            <Text style={styles.notesTitle}>Payment Information</Text>
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

        {/* 6. Signatures */}
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
            Generated by AKS Rental Invoice System • {invoiceNum} • {invoice.invoiceDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
