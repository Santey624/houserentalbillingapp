import Image from 'next/image'

// For light backgrounds — uses the PNG logo
// mix-blend-mode:multiply makes white pixels transparent so the logo blends naturally
export function Logo({ height = 32, className }: { height?: number; className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="GharKhata"
      width={Math.round(height * 3)}
      height={height}
      className={className}
      style={{ mixBlendMode: 'multiply' }}
      priority
    />
  )
}

// For dark panel backgrounds (auth sidebar, footer) — gold ख badge + white text
export function LogoDark({ showTagline = false }: { showTagline?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#E8A838] flex items-center justify-center flex-shrink-0 shadow-md">
        <span className="text-white font-bold text-xl leading-none" style={{ fontFamily: 'serif' }}>ख</span>
      </div>
      <div>
        <p className="text-white font-semibold text-xl tracking-tight leading-tight">GharKhata</p>
        {showTagline && (
          <p className="text-white/45 text-xs">Smart Rent Management</p>
        )}
      </div>
    </div>
  )
}
