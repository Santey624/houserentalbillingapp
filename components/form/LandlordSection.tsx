import SectionCard from "@/components/ui/SectionCard";
import FieldRow from "@/components/ui/FieldRow";
import Input from "@/components/ui/Input";
import { LandlordConfig } from "@/lib/invoiceTypes";

interface Props {
  landlord: LandlordConfig;
  onChange: <K extends keyof LandlordConfig>(key: K, value: LandlordConfig[K]) => void;
}

export default function LandlordSection({ landlord, onChange }: Props) {
  return (
    <SectionCard title="Landlord Settings">
      <FieldRow label="Landlord Name">
        <Input
          value={landlord.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Kali Gaire"
        />
      </FieldRow>
      <FieldRow label="Property Address">
        <Input
          value={landlord.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="e.g. Bagbazar, Kathmandu"
        />
      </FieldRow>
      <FieldRow label="Contact Number">
        <Input
          value={landlord.contact}
          onChange={(e) => onChange("contact", e.target.value)}
          placeholder="e.g. +977-9842985574"
        />
      </FieldRow>
      <FieldRow label="Electricity Rate (Rs./unit)">
        <Input
          type="number"
          min={0}
          step={0.5}
          value={landlord.electricityRate}
          onChange={(e) => onChange("electricityRate", parseFloat(e.target.value) || 0)}
        />
      </FieldRow>
      <FieldRow label="Payment Due Day">
        <Input
          type="number"
          min={1}
          max={31}
          value={landlord.paymentDueDay}
          onChange={(e) => onChange("paymentDueDay", parseInt(e.target.value) || 1)}
        />
      </FieldRow>
    </SectionCard>
  );
}
