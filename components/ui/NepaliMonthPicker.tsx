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
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${
                isSelected
                  ? "bg-[#2980b9] text-white border-[#2980b9]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#2980b9]"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
