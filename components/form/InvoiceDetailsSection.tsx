import SectionCard from "@/components/ui/SectionCard";
import FieldRow from "@/components/ui/FieldRow";
import Input from "@/components/ui/Input";
import NepaliMonthPicker from "@/components/ui/NepaliMonthPicker";
import { InvoiceDetails } from "@/lib/invoiceTypes";
import { ValidationErrors } from "@/lib/invoiceTypes";

interface Props {
  invoice: InvoiceDetails;
  onChange: <K extends keyof InvoiceDetails>(key: K, value: InvoiceDetails[K]) => void;
  onToggleMonth: (index: number) => void;
  errors: ValidationErrors;
}

export default function InvoiceDetailsSection({
  invoice,
  onChange,
  onToggleMonth,
  errors,
}: Props) {
  return (
    <SectionCard title="Invoice Details">
      <FieldRow label="Tenant Name" error={errors.tenantName}>
        <Input
          value={invoice.tenantName}
          onChange={(e) => onChange("tenantName", e.target.value)}
          placeholder="e.g. Anjan Sir"
          hasError={!!errors.tenantName}
        />
      </FieldRow>
      <FieldRow label="Billing Month(s)" error={errors.months}>
        <NepaliMonthPicker
          selected={invoice.selectedMonths}
          onToggle={onToggleMonth}
          error={errors.months}
        />
      </FieldRow>
      <FieldRow label="Nepali Year">
        <Input
          value={invoice.nepaliYear}
          onChange={(e) => onChange("nepaliYear", e.target.value)}
          placeholder="e.g. 2082"
        />
      </FieldRow>
      <FieldRow label="Invoice Date">
        <Input
          type="date"
          value={invoice.invoiceDate}
          onChange={(e) => onChange("invoiceDate", e.target.value)}
        />
      </FieldRow>
      <FieldRow label="Monthly Rent (Rs.)">
        <Input
          type="number"
          min={0}
          step={0.5}
          value={invoice.rentCost}
          onChange={(e) => onChange("rentCost", parseFloat(e.target.value) || 0)}
        />
      </FieldRow>
      <FieldRow label="Service / Min Charge (Rs.)">
        <Input
          type="number"
          min={0}
          step={0.5}
          value={invoice.serviceCharge}
          onChange={(e) => onChange("serviceCharge", parseFloat(e.target.value) || 0)}
        />
      </FieldRow>
    </SectionCard>
  );
}
