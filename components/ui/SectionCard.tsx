interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <div className="bg-[#2c3e50] text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide">
        {title}
      </div>
      <div className="p-4 bg-white space-y-3">{children}</div>
    </div>
  );
}
