export interface LandlordConfig {
  name: string;
  address: string;
  contact: string;
  electricityRate: number;
  paymentDueDay: number;
}

export interface InvoiceDetails {
  tenantName: string;
  selectedMonths: number[];
  nepaliYear: string;
  invoiceDate: string;
  rentCost: number;
  serviceCharge: number;
}

export interface MeterRow {
  id: string;
  name: string;
  prev: string;
  curr: string;
}

export interface CostRow {
  id: string;
  description: string;
  amount: string;
}

export interface ComputedMeter {
  name: string;
  prev: number;
  curr: number;
  consumed: number;
  cost: number;
}

export interface AdditionalCost {
  desc: string;
  amount: number;
}

export interface InvoiceData {
  landlord: LandlordConfig;
  invoice: InvoiceDetails;
  invoiceNum: string;
  nepaliMonth: string;
  meters: ComputedMeter[];
  totalUnits: number;
  totalElec: number;
  additionalCosts: AdditionalCost[];
  grandTotal: number;
}

export interface ValidationErrors {
  tenantName?: string;
  months?: string;
  meters?: Record<string, string>;
}
