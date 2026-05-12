export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-block bg-[#ff4d4d] text-white px-6 py-2 border-[3px] border-[#2d2d2d] font-heading text-2xl font-bold shadow-hard wobbly-md">
            ✏️ AKS Rental
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border-[3px] border-[#2d2d2d] px-6 sm:px-8 py-8 sm:py-10 relative shadow-hard-lg wobbly">
          {/* Tape strip */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-7 bg-[#e5e0d8]/80 border border-[#2d2d2d]/20 rotate-1 rounded-sm" />
          {children}
        </div>

        <p className="text-center text-xs text-[#2d2d2d]/40 mt-6 italic">
          — Nepal&apos;s friendliest rental platform —
        </p>
      </div>
    </div>
  )
}
