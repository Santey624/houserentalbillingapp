"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { InvoiceData } from "@/lib/invoiceTypes";
import { sanitizeFilename } from "@/lib/invoiceNumber";
import { downloadBlob, imageToDataUrl } from "@/lib/downloadBlob";

interface Props {
  onBeforeGenerate: () => InvoiceData | null; // returns null if validation fails
}

export default function GenerateButton({ onBeforeGenerate }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const data = onBeforeGenerate();
    if (!data) return;

    try {
      setLoading(true);
      const [logoDataUrl, qrDataUrl] = await Promise.all([
        imageToDataUrl("/gharkatha-logo.png"),
        imageToDataUrl(data.landlord.qrImageUrl),
      ]);
      const blob = await pdf(
        <InvoicePDF
          data={{
            ...data,
            landlord: { ...data.landlord, qrImageUrl: qrDataUrl },
            meta: { ...data.meta, logoDataUrl },
          }}
        />
      ).toBlob();
      const ts = new Date()
        .toISOString()
        .replace(/[-:T]/g, "")
        .slice(0, 15);
      const tenant = sanitizeFilename(data.invoice.tenantName) || "Invoice";
      downloadBlob(blob, `${tenant}_${ts}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-primary w-full h-12 text-base mt-2 disabled:opacity-60"
    >
      {loading ? "Preparing PDF..." : "Generate PDF Invoice"}
    </button>
  );
}
