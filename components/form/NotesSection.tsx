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
        <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
      )}

      {notes.map((note, i) => (
        <div key={i} className="flex gap-2 items-start">
          <textarea
            value={note}
            onChange={(e) => onUpdate(i, e.target.value)}
            placeholder={`Note ${i + 1} — e.g. Water supply disruption on 5th`}
            rows={2}
            className="textarea-modern flex-1 resize-y"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors border border-border mt-1"
            title="Remove note"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-accent text-sm hover:underline underline-offset-2 mt-1"
      >
        + Add Note
      </button>
    </SectionCard>
  );
}
