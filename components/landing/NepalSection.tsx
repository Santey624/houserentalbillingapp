import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  BellRing,
  FileText,
  QrCode,
  Building2,
  LayoutDashboard,
  FileSpreadsheet,
  Timer,
  Home,
  Smile,
} from 'lucide-react'

const capabilities = [
  { icon: CalendarDays, label: 'Nepali Calendar Billing' },
  { icon: BellRing, label: 'Rent Reminders' },
  { icon: FileText, label: 'Digital Invoices' },
  { icon: QrCode, label: 'QR & Local Payments' },
  { icon: Building2, label: 'Building Management' },
  { icon: LayoutDashboard, label: 'Owner Dashboard' },
]

const stats = [
  { icon: FileSpreadsheet, value: '10,000+', label: 'Invoices Generated' },
  { icon: Timer, value: '98%', label: 'On-time Rent Collection' },
  { icon: Home, value: '500+', label: 'Buildings Managed' },
  { icon: Smile, value: '250+', label: 'Happy Landlords' },
]

export default function NepalSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem]">
              Designed Around How Nepal Actually Works.
            </h2>
          </div>
          <Link
            href="/rent-management-nepal"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-800 transition-colors duration-300 hover:text-zinc-950"
          >
            Learn More <ArrowRight size={14} />
          </Link>
        </div>

        <ul className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {capabilities.map((feature) => {
            const Icon = feature.icon
            return (
              <li
                key={feature.label}
                className="landing-bento flex flex-col items-center rounded-2xl px-3 py-5 text-center"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <p className="max-w-[8.5rem] text-xs font-medium leading-snug text-zinc-700 sm:text-sm">
                  {feature.label}
                </p>
              </li>
            )
          })}
        </ul>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09090b] p-5 sm:p-8">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.25), transparent 70%)' }}
            aria-hidden="true"
          />
          <ul className="relative grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <li key={stat.label} className="text-center lg:text-left">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#c9a96e]">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <p className="landing-serif text-2xl tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">{stat.label}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
