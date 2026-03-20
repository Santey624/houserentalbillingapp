export const NEPALI_MONTHS = [
  "Baisakh (बैशाख)",
  "Jestha (जेष्ठ)",
  "Ashadh (आषाढ)",
  "Shrawan (श्रावण)",
  "Bhadra (भाद्र)",
  "Ashwin (आश्विन)",
  "Kartik (कार्तिक)",
  "Mangsir (मंसिर)",
  "Poush (पौष)",
  "Magh (माघ)",
  "Falgun (फाल्गुन)",
  "Chaitra (चैत्र)",
];

export const DEFAULT_LANDLORD = {
  name: "Kali Gaire",
  address: "Bagbazar, Kathmandu",
  contact: "+977-9842985574",
  electricityRate: 17.0,
  paymentDueDay: 2,
};

export const DEFAULT_INVOICE = {
  tenantName: "",
  selectedMonths: [9], // Magh (0-indexed)
  nepaliYear: "2082",
  invoiceDate: new Date().toISOString().split("T")[0],
  rentCost: 35750.0,
  serviceCharge: 0.0,
};

export const DEFAULT_METERS = [
  { id: "m1", name: "Meter 1", prev: "4979", curr: "4989" },
  { id: "m2", name: "Meter 2", prev: "", curr: "" },
];

export const DEFAULT_COSTS = [
  { id: "c1", description: "Wastage", amount: "0" },
  { id: "c2", description: "Water", amount: "0" },
];
