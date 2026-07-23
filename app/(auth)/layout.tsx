import Link from 'next/link'
import type { Metadata } from 'next'
import { Building2, FileText, Wrench } from 'lucide-react'
import { LogoDark } from '@/components/shared/Logo'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* ── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col bg-[#050506] relative overflow-hidden p-12 border-r border-border">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.45), transparent)',
            filter: 'blur(80px)',
          }}
        />

        <Link href="/" className="relative mb-auto">
          <LogoDark showTagline />
        </Link>

        <div className="relative space-y-6 my-auto">
          {[
            { icon: Building2, text: 'Manage buildings & units across Nepal' },
            { icon: FileText, text: 'Generate invoices in Nepali calendar' },
            { icon: Wrench, text: 'Track payments & maintenance requests' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#c9a96e]" strokeWidth={1.5} />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <p className="relative text-zinc-600 text-xs mt-auto">
          Nepal&apos;s modern rental management platform
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <Link href="/" className="lg:hidden mb-10">
          <LogoDark height={52} />
        </Link>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
