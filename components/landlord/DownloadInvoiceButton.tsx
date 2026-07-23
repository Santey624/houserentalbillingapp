"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { sanitizeFilename } from "@/lib/invoiceNumber";
import { downloadBlob, imageToDataUrl } from "@/lib/downloadBlob";
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
    dueDate: string | null;
    status: string;
    notes: string | null;
    lineItems: LineItem[];
    building: {
      name: string;
      address: string;
      contact: string;
    };
    unit: {
      unitNumber: string;
      floor: string | null;
    };
  };
  landlord: {
    displayName: string;
    address: string;
    contact: string;
    electricityRate: number;
    paymentDueDay: number;
    bankDetails: string | null;
    qrImageUrl: string | null;
  };
}

export default function DownloadInvoiceButton({ invoice, landlord }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);

      const [logoDataUrl, qrDataUrl] = await Promise.all([
        imageToDataUrl("/gharkatha-logo.png"),
        imageToDataUrl(landlord.qrImageUrl),
      ]);

      const meters = invoice.lineItems
        .filter((li) => li.meterReading !== null)
        .map((li) => ({
          name: li.description,
          prev: li.meterReading!.prevReading,
          curr: li.meterReading!.currReading,
          consumed: li.meterReading!.consumed,
          cost: li.amount,
        }));

      const skipDescriptions = [
        "House Rent",
        "Electricity Charges",
        "Service Charge",
        "Service / Minimum Charge",
      ];
      const additionalCosts = invoice.lineItems
        .filter(
          (li) =>
            !li.meterReading &&
            !skipDescriptions.some(
              (s) =>
                li.description.startsWith(s) ||
                li.description.toLowerCase().includes(s.toLowerCase())
            )
        )
        .map((li) => ({ desc: li.description, amount: li.amount }));

      const data: InvoiceData = {
        landlord: {
          name: landlord.displayName,
          address: landlord.address,
          contact: landlord.contact,
          electricityRate: landlord.electricityRate,
          paymentDueDay: landlord.paymentDueDay,
          bankDetails: landlord.bankDetails,
          qrImageUrl: qrDataUrl,
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
        meta: {
          buildingName: invoice.building.name,
          buildingAddress: invoice.building.address,
          buildingContact: invoice.building.contact,
          unitNumber: invoice.unit.unitNumber,
          floor: invoice.unit.floor,
          dueDate: invoice.dueDate,
          status: invoice.status,
          logoDataUrl,
        },
        meters,
        totalUnits: meters.reduce((sum, m) => sum + m.consumed, 0),
        totalElec: invoice.totalElec,
        additionalCosts,
        grandTotal: invoice.grandTotal,
        notes: invoice.notes ? invoice.notes.split("\n").filter(Boolean) : [],
      };

      const blob = await pdf(<InvoicePDF data={data} />).toBlob();
      downloadBlob(
        blob,
        `${sanitizeFilename(invoice.tenantName)}_${invoice.invoiceNumber}.pdf`
      );
    } catch (error) {
      console.error("Failed to generate invoice PDF:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-secondary text-sm disabled:opacity-60"
    >
      {loading ? "Preparing PDF..." : "Download PDF"}
    </button>
  );
}
