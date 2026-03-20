"use client";

import dynamic from "next/dynamic";
import LandlordSection from "@/components/form/LandlordSection";
import InvoiceDetailsSection from "@/components/form/InvoiceDetailsSection";
import ElectricitySection from "@/components/form/ElectricitySection";
import AdditionalCostsSection from "@/components/form/AdditionalCostsSection";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";

// Load GenerateButton (which uses @react-pdf/renderer) client-side only
const GenerateButton = dynamic(
  () => import("@/components/form/GenerateButton"),
  { ssr: false }
);

export default function Home() {
  const form = useInvoiceForm();

  function handleGenerate() {
    if (!form.validate()) return null;
    return form.assembleInvoiceData();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#0f3460] text-white py-4 px-6 shadow-md">
        <h1 className="text-xl font-bold tracking-wide">
          AKS Building — Rental Invoice Generator
        </h1>
        <p className="text-xs text-blue-200 mt-0.5">
          Generate professional rental invoices for Nepal
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <LandlordSection
          landlord={form.landlord}
          onChange={form.updateLandlord}
        />
        <InvoiceDetailsSection
          invoice={form.invoice}
          onChange={form.updateInvoice}
          onToggleMonth={form.toggleMonth}
          errors={form.errors}
        />
        <ElectricitySection
          meters={form.meters}
          electricityRate={form.landlord.electricityRate}
          meterErrors={form.errors.meters}
          onAdd={form.addMeter}
          onRemove={form.removeMeter}
          onUpdate={form.updateMeter}
        />
        <AdditionalCostsSection
          costs={form.costs}
          onAdd={form.addCost}
          onRemove={form.removeCost}
          onUpdate={form.updateCost}
        />

        <GenerateButton onBeforeGenerate={handleGenerate} />

        <noscript>
          <p className="text-red-500 text-sm mt-4 text-center">
            JavaScript is required to generate invoices.
          </p>
        </noscript>
      </div>
    </main>
  );
}
