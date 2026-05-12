"use client";

import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { sanitizeFilename } from "@/lib/invoiceNumber";
import type { InvoiceData } from "@/lib/invoiceTypes";

interface LineItem {
  description: string;
  amount: number;
  meterReading: { prevReading: number; currReading: number; consumed: number } | null;
}

interface Props {
  invoice: {
    invoiceNumber: string;
    tenantName: string;
    nepaliMonth: string;
    nepaliYear: string;
    invoiceDate: string;
    rentCost: number;
    serviceCharge: number;
    totalElec: number;
    grandTotal: number;
    notes: string | null;
    lineItems: LineItem[];
  };
  landlord: {
    displayName: string;
    address: string;
    contact: string;
    electricityRate: number;
    paymentDueDay: number;
  };
}

export default function DownloadInvoiceButton({ invoice, landlord }: Props) {
  async function handleDownload() {
    const meters = invoice.lineItems
      .filter((li) => li.meterReading !== null)
      .map((li) => ({
        name: li.description,
        prev: li.meterReading!.prevReading,
        curr: li.meterReading!.currReading,
        consumed: li.meterReading!.consumed,
        cost: li.amount,
      }));

    const skipDescriptions = ["House Rent", "Electricity Charges", "Service Charge", "Service / Minimum Charge"];
    const additionalCosts = invoice.lineItems
      .filter(
        (li) =>
          !li.meterReading &&
          !skipDescriptions.some((s) => li.description.toLowerCase().includes(s.toLowerCase()))
      )
      .map((li) => ({ desc: li.description, amount: li.amount }));

    const data: InvoiceData = {
      landlord: {
        name: landlord.displayName,
        address: landlord.address,
        contact: landlord.contact,
        electricityRate: landlord.electricityRate,
        paymentDueDay: landlord.paymentDueDay,
      },
      invoice: {
        tenantName: invoice.tenantName,
        selectedMonths: [],
        nepaliYear: invoice.nepaliYear,
        invoiceDate: invoice.invoiceDate,
        rentCost: invoice.rentCost,
        serviceCharge: invoice.serviceCharge,
      },
      invoiceNum: invoice.invoiceNumber,
      nepaliMonth: invoice.nepaliMonth,
      meters,
      totalUnits: meters.reduce((sum, m) => sum + m.consumed, 0),
      totalElec: invoice.totalElec,
      additionalCosts,
      grandTotal: invoice.grandTotal,
      notes: invoice.notes ? invoice.notes.split("\n").filter(Boolean) : [],
    };

    const blob = await pdf(<InvoicePDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizeFilename(invoice.tenantName)}_${invoice.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="text-sm font-semibold text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
    >
      Download PDF
    </button>
  );
}
