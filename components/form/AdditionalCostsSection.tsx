import SectionCard from "@/components/ui/SectionCard";
import Input from "@/components/ui/Input";
import { CostRow } from "@/lib/invoiceTypes";

interface Props {
  costs: CostRow[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: keyof Omit<CostRow, "id">, value: string) => void;
}

export default function AdditionalCostsSection({
  costs,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <SectionCard title="Additional Costs">
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs font-semibold text-gray-500 uppercase mb-1 px-1">
        <span>Description</span>
        <span>Amount (Rs.)</span>
        <span />
      </div>

      {costs.map((cost) => (
        <div key={cost.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
          <Input
            value={cost.description}
            onChange={(e) => onUpdate(cost.id, "description", e.target.value)}
            placeholder="e.g. Water"
          />
          <Input
            type="number"
            min={0}
            step={0.5}
            value={cost.amount}
            onChange={(e) => onUpdate(cost.id, "amount", e.target.value)}
            placeholder="0"
            className="w-28"
          />
          <button
            type="button"
            onClick={() => onRemove(cost.id)}
            className="text-red-400 hover:text-red-600 text-lg leading-none font-bold px-1"
            title="Remove row"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="text-sm text-[#2980b9] hover:underline mt-1"
      >
        + Add Cost
      </button>
    </SectionCard>
  );
}
