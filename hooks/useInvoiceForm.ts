"use client";

import { useState } from "react";
import {
  LandlordConfig,
  InvoiceDetails,
  MeterRow,
  CostRow,
  ValidationErrors,
  InvoiceData,
} from "@/lib/invoiceTypes";
import {
  DEFAULT_LANDLORD,
  DEFAULT_INVOICE,
  DEFAULT_METERS,
  DEFAULT_COSTS,
  NEPALI_MONTHS,
} from "@/lib/constants";
import {
  computeMeters,
  filterCosts,
  computeGrandTotal,
} from "@/lib/calculations";
import { generateInvoiceNumber } from "@/lib/invoiceNumber";

export function useInvoiceForm() {
  const [landlord, setLandlord] = useState<LandlordConfig>(DEFAULT_LANDLORD);
  const [invoice, setInvoice] = useState<InvoiceDetails>(DEFAULT_INVOICE);
  const [meters, setMeters] = useState<MeterRow[]>(DEFAULT_METERS);
  const [costs, setCosts] = useState<CostRow[]>(DEFAULT_COSTS);
  const [notes, setNotes] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [errors, setErrors] = useState<ValidationErrors>({});

  function updateLandlord<K extends keyof LandlordConfig>(
    key: K,
    value: LandlordConfig[K]
  ) {
    setLandlord((prev) => ({ ...prev, [key]: value }));
  }

  function updateInvoice<K extends keyof InvoiceDetails>(
    key: K,
    value: InvoiceDetails[K]
  ) {
    setInvoice((prev) => ({ ...prev, [key]: value }));
  }

  function toggleMonth(index: number) {
    setInvoice((prev) => {
      const selected = prev.selectedMonths.includes(index)
        ? prev.selectedMonths.filter((m) => m !== index)
        : [...prev.selectedMonths, index];
      return { ...prev, selectedMonths: selected };
    });
  }

  function addMeter() {
    setMeters((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: "", prev: "", curr: "" },
    ]);
  }

  function removeMeter(id: string) {
    setMeters((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMeter(id: string, key: keyof Omit<MeterRow, "id">, value: string) {
    setMeters((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );
  }

  function addCost() {
    setCosts((prev) => [
      ...prev,
      { id: `c${Date.now()}`, description: "", amount: "0" },
    ]);
  }

  function removeCost(id: string) {
    setCosts((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCost(id: string, key: keyof Omit<CostRow, "id">, value: string) {
    setCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  }

  function addNote() {
    setNotes((prev) => [...prev, ""]);
  }

  function removeNote(index: number) {
    setNotes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateNote(index: number, value: string) {
    setNotes((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function validate(): boolean {
    const errs: ValidationErrors = {};

    if (!invoice.tenantName.trim()) {
      errs.tenantName = "Tenant name is required";
    }
    if (invoice.selectedMonths.length === 0) {
      errs.months = "Select at least one month";
    }

    const meterErrors: Record<string, string> = {};
    for (const m of meters) {
      if (m.prev === "" && m.curr === "") continue;
      const prev = parseFloat(m.prev);
      const curr = parseFloat(m.curr);
      if (isNaN(prev) || isNaN(curr)) {
        meterErrors[m.id] = "Invalid reading";
      } else if (curr < prev) {
        meterErrors[m.id] = "Current reading must be ≥ previous";
      }
    }
    if (Object.keys(meterErrors).length > 0) {
      errs.meters = meterErrors;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function assembleInvoiceData(): InvoiceData {
    const sorted = [...invoice.selectedMonths].sort((a, b) => a - b);
    const nepaliMonth = sorted
      .map((i) => NEPALI_MONTHS[i].split(" (")[0])
      .join(" & ");

    const { details, totalUnits, totalElec } = computeMeters(
      meters,
      landlord.electricityRate
    );
    const additionalCosts = filterCosts(costs);
    const grandTotal = computeGrandTotal(
      invoice.rentCost,
      totalElec,
      invoice.serviceCharge,
      additionalCosts
    );

    return {
      landlord,
      invoice,
      invoiceNum: generateInvoiceNumber(),
      nepaliMonth,
      meters: details,
      totalUnits,
      totalElec,
      additionalCosts,
      grandTotal,
      notes: notes.filter((n) => n.trim() !== ""),
    };
  }

  return {
    landlord,
    invoice,
    meters,
    costs,
    notes,
    status,
    errors,
    updateLandlord,
    updateInvoice,
    toggleMonth,
    addMeter,
    removeMeter,
    updateMeter,
    addCost,
    removeCost,
    updateCost,
    addNote,
    removeNote,
    updateNote,
    validate,
    assembleInvoiceData,
    setStatus,
    setErrors,
  };
}
