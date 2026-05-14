import { Document, Page, View, Text, Font, Image } from "@react-pdf/renderer";
import { InvoiceData } from "@/lib/invoiceTypes";
import { styles } from "./pdfStyles";

Font.register({
  family: "Playfair Display",
  fonts: [
    { src: "/fonts/playfair-display-latin-400-normal.woff" },
    { src: "/fonts/playfair-display-latin-700-normal.woff", fontWeight: 700 },
    { src: "/fonts/playfair-display-latin-400-italic.woff", fontStyle: "italic" },
  ],
});

Font.register({
  family: "DM Sans",
  fonts: [
    { src: "/fonts/dm-sans-latin-400-normal.woff" },
    { src: "/fonts/dm-sans-latin-700-normal.woff", fontWeight: 700 },
    { src: "/fonts/dm-sans-latin-400-normal.woff", fontStyle: "italic" },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

interface Props {
  data: InvoiceData;
}

type LineItem = {
  description: string;
  detail?: string;
  units?: string;
  rate?: string;
  amount: number;
};

function formatRs(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

function ordinal(day: number) {
  if (day > 10 && day < 20) return `${day}th`;
  const suffix = day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
}

function formatStatus(status?: string) {
  return (status || "UNPAID").replace(/_/g, " ");
}

function paymentDetailLines(details?: string | null) {
  return (details || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildLineItems(data: InvoiceData): LineItem[] {
  const { landlord, invoice, meters, totalUnits, totalElec, additionalCosts } = data;
  const items: LineItem[] = [];

  if (invoice.rentCost > 0) {
    items.push({
      description: "Monthly Rent",
      detail: `${data.nepaliMonth} ${invoice.nepaliYear}`,
      amount: invoice.rentCost,
    });
  }

  if (totalElec > 0 || meters.length > 0) {
    items.push({
      description: "Electricity Charges",
      detail:
        meters.length > 0
          ? meters
              .map(
                (meter) =>
                  `${meter.name}: ${formatNum(meter.prev)} to ${formatNum(meter.curr)} (${formatNum(
                    meter.consumed
                  )} units)`
              )
              .join("; ")
          : undefined,
      units: totalUnits > 0 ? `${formatNum(totalUnits)}` : undefined,
      rate: landlord.electricityRate ? `Rs. ${landlord.electricityRate}/unit` : undefined,
      amount: totalElec,
    });
  }

  if (invoice.serviceCharge > 0) {
    items.push({
      description: "Service / Minimum Charge",
      amount: invoice.serviceCharge,
    });
  }

  additionalCosts.forEach((cost) => {
    items.push({
      description: cost.desc,
      amount: cost.amount,
    });
  });

  return items;
}

export default function InvoicePDF({ data }: Props) {
  const { landlord, invoice, invoiceNum, nepaliMonth, grandTotal, meta } = data;
  const lineItems = buildLineItems(data);
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const buildingName = meta?.buildingName || "Building";
  const buildingAddress = meta?.buildingAddress || landlord.address;
  const unitLabel = meta?.unitNumber ? `Unit ${meta.unitNumber}` : "Unit not assigned";
  const floorLabel = meta?.floor ? `Floor ${meta.floor}` : "";
  const bankLines = paymentDetailLines(landlord.bankDetails);
  const hasPaymentMethods = bankLines.length > 0 || Boolean(landlord.qrImageUrl);

  return (
    <Document title={`${invoiceNum} - ${invoice.tenantName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Image src="/gharkhata-logo.png" style={styles.logo} />
            <Text style={styles.brandTagline}>Rental billing and property management</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={styles.statusBadge}>{formatStatus(meta?.status)}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoiceNum}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text style={styles.metaValue}>{invoice.invoiceDate}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{meta?.dueDate || `${ordinal(landlord.paymentDueDay)} of month`}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Billing Period</Text>
            <Text style={styles.metaValue}>
              {nepaliMonth} {invoice.nepaliYear}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>FROM</Text>
            <Text style={styles.partyName}>{landlord.name}</Text>
            <Text style={styles.partyDetail}>{landlord.address}</Text>
            {landlord.contact ? <Text style={styles.partyDetail}>{landlord.contact}</Text> : null}
          </View>

          <View style={[styles.partyCard, styles.partyCardStrong]}>
            <Text style={[styles.partyLabel, styles.partyLabelStrong]}>BILL TO</Text>
            <Text style={[styles.partyName, styles.partyNameStrong]}>{invoice.tenantName}</Text>
            <Text style={[styles.partyDetail, styles.partyDetailStrong]}>{buildingName}</Text>
            <Text style={[styles.partyDetail, styles.partyDetailStrong]}>
              {unitLabel}
              {floorLabel ? `, ${floorLabel}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Building</Text>
            <Text style={styles.metaValue}>{buildingName}</Text>
            <Text style={styles.metaSubValue}>{buildingAddress}</Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>Unit</Text>
            <Text style={styles.metaValue}>{unitLabel}</Text>
            {floorLabel ? <Text style={styles.metaSubValue}>{floorLabel}</Text> : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>CHARGES</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderText, styles.colUnits]}>UNITS</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>RATE</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>AMOUNT</Text>
          </View>

          {lineItems.map((item, index) => (
            <View key={`${item.description}-${index}`} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
              <View style={styles.colDescription}>
                <Text style={styles.itemDesc}>{item.description}</Text>
                {item.detail ? <Text style={styles.itemDetail}>{item.detail}</Text> : null}
              </View>
              <Text style={styles.colUnits}>{item.units || "-"}</Text>
              <Text style={styles.colRate}>{item.rate || "-"}</Text>
              <Text style={styles.colAmount}>{formatRs(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsArea}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>PAYMENT INFORMATION</Text>
            <Text style={styles.paymentText}>Payment is due by the {ordinal(landlord.paymentDueDay)} of each month.</Text>
            <Text style={styles.paymentText}>Include invoice number {invoiceNum} and {unitLabel} with your payment.</Text>
            <Text style={styles.paymentText}>
              For billing queries, contact {landlord.name}
              {landlord.contact ? ` at ${landlord.contact}` : ""}.
            </Text>
            {hasPaymentMethods ? (
              <View style={styles.paymentMethodsRow}>
                {bankLines.length > 0 ? (
                  <View style={styles.bankDetailsBox}>
                    <Text style={styles.paymentTitle}>BANK / TRANSFER DETAILS</Text>
                    {bankLines.map((line, index) => (
                      <Text key={index} style={styles.bankDetailsText}>
                        {line}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {landlord.qrImageUrl ? (
                  <View style={styles.qrBox}>
                    <Image src={landlord.qrImageUrl} style={styles.qrImage} />
                    <Text style={styles.qrLabel}>Payment QR</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatRs(subtotal)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Adjustments</Text>
              <Text style={styles.totalValue}>{formatRs(grandTotal - subtotal)}</Text>
            </View>
            <View style={styles.amountDue}>
              <Text style={styles.amountDueLabel}>AMOUNT DUE</Text>
              <Text style={styles.amountDueValue}>{formatRs(grandTotal)}</Text>
            </View>
          </View>
        </View>

        {data.notes.length > 0 ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>NOTES</Text>
            {data.notes.map((note, index) => (
              <Text key={index} style={styles.noteItem}>
                {note}
              </Text>
            ))}
          </View>
        ) : null}

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

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by GharKhata | {invoiceNum} | {buildingName} {meta?.unitNumber ? `Unit ${meta.unitNumber}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
