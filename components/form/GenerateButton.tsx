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
      className="w-full bg-[#0f3460] hover:bg-[#1a4a80] text-white font-bold py-3 px-6 rounded-lg text-base tracking-wide transition-colors mt-2"
    >
      GENERATE PDF INVOICE
    </button>
  );
}
