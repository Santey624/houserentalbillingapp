import Link from 'next/link'
import { ArrowRight, Building2, Users, Wallet, CircleDollarSign, Activity } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section
      id="solution"
      className="relative overflow-hidden bg-[#0A0F1E] px-5 py-20 sm:px-8 sm:py-28 scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl lg:mb-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7BA3FF]">
            The Solution
          </p>
          <h2 className="mb-4 text-3xl leading-[1.15] text-white sm:text-4xl lg:text-[2.65rem]">
            Everything. One Platform.
          </h2>
          <p className="mb-6 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
            Buildings, units, Nepali invoices, payment proofs, and maintenance—connected in a single
            workspace.
          </p>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#7BA3FF] transition hover:text-white"
          >
            Explore Features <ArrowRight size={14} />
          </Link>
        </div>

        {/* Dashboard mock matching design layout */}
        <div className="landing-mockup overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-xs text-white/35">GharKatha · Landlord</span>
          </div>

          <div className="grid lg:grid-cols-[200px_1fr]">
            <aside className="hidden border-r border-white/10 bg-[#0B1220] p-4 lg:block">
              <p className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                Menu
              </p>
              <ul className="space-y-1 text-sm text-white/55">
                {[
                  'Overview',
                  'Buildings',
                  'Tenants',
                  'Rent',
                  'Invoices',
                  'Maintenance',
                  'Settings',
                ].map((item, i) => (
                  <li
                    key={item}
                    className={`rounded-lg px-3 py-2 ${i === 0 ? 'bg-accent text-white' : 'hover:bg-white/5'}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </aside>

            <div className="bg-[#F8FAFC] p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">Dashboard</p>
                  <p className="text-xs text-slate-400">This month overview</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                  <Activity size={10} /> Live
                </span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { icon: Building2, label: 'Total Buildings', value: '12' },
                  { icon: Users, label: 'Total Tenants', value: '48' },
                  { icon: Wallet, label: 'Rent Collected', value: 'Rs. 2,45,800' },
                  { icon: CircleDollarSign, label: 'Pending Rent', value: 'Rs. 38,200' },
                ].map((m) => {
                  const Icon = m.icon
                  return (
                    <div
                      key={m.label}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-center gap-1.5 text-slate-400">
                        <Icon size={13} />
                        <span className="text-[10px]">{m.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">{m.value}</p>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Recent Activities
                  </p>
                  <ul className="space-y-3">
                    {[
                      { name: 'Rent received from Binod Shrestha', status: 'Completed', tone: 'bg-emerald-50 text-emerald-700' },
                      { name: 'Invoice generated · Unit 3B', status: 'Completed', tone: 'bg-emerald-50 text-emerald-700' },
                      { name: 'Maintenance · Water tank leak', status: 'In Progress', tone: 'bg-amber-50 text-amber-700' },
                    ].map((row) => (
                      <li key={row.name} className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-slate-700">{row.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tone}`}>
                          {row.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Rent Collection
                  </p>
                  <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-accent border-r-slate-100 border-b-slate-100">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-slate-900">86%</p>
                      <p className="text-[10px] text-slate-400">Collected</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500">This month&apos;s collection pace</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
