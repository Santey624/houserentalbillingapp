import SectionCard from "@/components/ui/SectionCard";
import Input from "@/components/ui/Input";
import { MeterRow } from "@/lib/invoiceTypes";

interface Props {
  meters: MeterRow[];
  electricityRate: number;
  meterErrors?: Record<string, string>;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, key: keyof Omit<MeterRow, "id">, value: string) => void;
}

export default function ElectricitySection({
  meters,
  electricityRate,
  meterErrors = {},
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <SectionCard title="Electricity Meter Readings">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-semibold text-muted-foreground uppercase mb-1 px-1">
        <span>Meter Name</span>
        <span>Prev Reading</span>
        <span>Curr Reading</span>
        <span />
      </div>

      {meters.map((meter) => {
        const prev = parseFloat(meter.prev);
        const curr = parseFloat(meter.curr);
        const valid = !isNaN(prev) && !isNaN(curr) && curr >= prev;
        const consumed = valid ? curr - prev : null;
        const cost = consumed !== null ? consumed * electricityRate : null;
        const err = meterErrors[meter.id];

        return (
          <div key={meter.id} className="space-y-1">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
              <Input
                value={meter.name}
                onChange={(e) => onUpdate(meter.id, "name", e.target.value)}
                placeholder="Meter 1"
                hasError={!!err}
              />
              <Input
                type="number"
                min={0}
                value={meter.prev}
                onChange={(e) => onUpdate(meter.id, "prev", e.target.value)}
                placeholder="0"
                hasError={!!err}
              />
              <Input
                type="number"
                min={0}
                value={meter.curr}
                onChange={(e) => onUpdate(meter.id, "curr", e.target.value)}
                placeholder="0"
                hasError={!!err}
              />
              <button
                type="button"
                onClick={() => onRemove(meter.id)}
                className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors border border-border"
                title="Remove meter"
              >
                ×
              </button>
            </div>
            {err && <p className="field-error pl-1">{err}</p>}
            {consumed !== null && (
              <p className="text-xs text-muted-foreground pl-1">
                {consumed} units × Rs.{electricityRate} = <span className="font-medium text-foreground">Rs. {cost?.toFixed(2)}</span>
              </p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline underline-offset-2 mt-1"
      >
        + Add Meter
      </button>
    </SectionCard>
  );
}
