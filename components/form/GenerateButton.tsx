"use client";

import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/pdf/InvoicePDF";
import { InvoiceData } from "@/lib/invoiceTypes";
import { sanitizeFilename } from "@/lib/invoiceNumber";

interface Props {
  onBeforeGenerate: () => InvoiceData | null; // returns null if validation fails
}

export default function GenerateButton({ onBeforeGenerate }: Props) {
  async function handleClick() {
    const data = onBeforeGenerate();
    if (!data) return;

    const blob = await pdf(<InvoicePDF data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const ts = new Date()
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 15);
    const tenant = sanitizeFilename(data.invoice.tenantName) || "Invoice";
    link.href = url;
    link.download = `${tenant}_${ts}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="btn-primary w-full h-12 text-base mt-2"
    >
      Generate PDF Invoice
    </button>
  );
}
