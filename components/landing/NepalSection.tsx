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
            <h2 className="text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.65rem]">
              Designed Around How Nepal Actually Works.
            </h2>
          </div>
          <Link
            href="/rent-management-nepal"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent hover:underline underline-offset-2"
          >
            Learn More <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative mb-16">
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-7 hidden h-px border-t border-dashed border-slate-200 md:block"
            aria-hidden="true"
          />
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {capabilities.map((feature) => {
              const Icon = feature.icon
              return (
                <li key={feature.label} className="flex flex-col items-center text-center">
                  <span className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                    <Icon size={20} className="text-accent" />
                  </span>
                  <p className="max-w-[8.5rem] text-xs font-medium leading-snug text-slate-700 sm:text-sm">
                    {feature.label}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#0A0F1E] px-5 py-8 sm:px-10 sm:py-10">
          <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <li key={stat.label} className="text-center lg:text-left">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#7BA3FF]">
                    <Icon size={18} />
                  </div>
                  <p className="font-heading text-2xl text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/45 sm:text-sm">{stat.label}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
