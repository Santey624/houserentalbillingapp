import SectionCard from "@/components/ui/SectionCard";

interface Props {
  notes: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
}

export default function NotesSection({ notes, onAdd, onRemove, onUpdate }: Props) {
  return (
    <SectionCard title="Landlord Notes">
      {notes.length === 0 && (
        <p className="text-sm text-gray-400 italic">No notes added yet.</p>
      )}

      {notes.map((note, i) => (
        <div key={i} className="flex gap-2 items-start">
          <textarea
            value={note}
            onChange={(e) => onUpdate(i, e.target.value)}
            placeholder={`Note ${i + 1} — e.g. Water supply disruption on 5th`}
            rows={2}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-[#2980b9]"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-red-400 hover:text-red-600 text-lg leading-none font-bold px-1 mt-2"
            title="Remove note"
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
        + Add Note
      </button>
    </SectionCard>
  );
}
