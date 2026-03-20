interface FieldRowProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export default function FieldRow({ label, error, children }: FieldRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <label className="text-sm font-medium text-gray-600 sm:w-44 shrink-0">
        {label}
      </label>
      <div className="flex-1">
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}
