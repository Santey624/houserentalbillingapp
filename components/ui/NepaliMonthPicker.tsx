import { NEPALI_MONTHS } from "@/lib/constants";

interface NepaliMonthPickerProps {
  selected: number[];
  onToggle: (index: number) => void;
  error?: string;
}

export default function NepaliMonthPicker({
  selected,
  onToggle,
  error,
}: NepaliMonthPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
        {NEPALI_MONTHS.map((month, i) => {
          const isSelected = selected.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              className={`text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                isSelected
                  ? "gradient-bg text-white border-transparent"
                  : "bg-card text-foreground border-border hover:border-accent/40"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  );
}
