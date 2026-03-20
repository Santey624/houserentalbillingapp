import { MeterRow, CostRow, ComputedMeter, AdditionalCost } from "./invoiceTypes";

export function computeMeters(
  rows: MeterRow[],
  rate: number
): { details: ComputedMeter[]; totalUnits: number; totalElec: number } {
  const details: ComputedMeter[] = [];

  for (const row of rows) {
    if (row.prev === "" && row.curr === "") continue;
    const prev = parseFloat(row.prev) || 0;
    const curr = parseFloat(row.curr) || 0;
    const consumed = curr - prev;
    const cost = consumed * rate;
    details.push({ name: row.name || "Unnamed Meter", prev, curr, consumed, cost });
  }

  const totalUnits = details.reduce((s, m) => s + m.consumed, 0);
  const totalElec = details.reduce((s, m) => s + m.cost, 0);
  return { details, totalUnits, totalElec };
}

export function filterCosts(rows: CostRow[]): AdditionalCost[] {
  return rows
    .filter((r) => r.description.trim() !== "" && parseFloat(r.amount) !== 0)
    .map((r) => ({ desc: r.description.trim(), amount: parseFloat(r.amount) || 0 }));
}

export function computeGrandTotal(
  rent: number,
  totalElec: number,
  serviceCharge: number,
  costs: AdditionalCost[]
): number {
  const extra = costs.reduce((s, c) => s + c.amount, 0);
  return rent + totalElec + serviceCharge + extra;
}
