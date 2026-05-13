interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="card-modern overflow-hidden mb-4">
      <div className="gradient-bg text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-widest">
        {title}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}
