import Link from 'next/link'
import { ArrowRight, Building2, Users, Wallet, CircleDollarSign } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section
      id="solution"
      className="relative overflow-hidden bg-[#09090b] px-5 py-20 sm:px-8 sm:py-28 scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.35), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl lg:mb-14">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a96e]/80">
            The Solution
          </p>
          <h2 className="mb-4 text-3xl leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
            Everything. One Platform.
          </h2>
          <p className="mb-6 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
            Buildings, units, Nepali invoices, payment proofs, and maintenance—connected in a single
            workspace.
          </p>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-white"
          >
            Explore Features <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[1.75rem] opacity-60 blur-2xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(201,169,110,0.22), transparent 40%, rgba(255,255,255,0.06))',
            }}
            aria-hidden="true"
          />

          <div className="landing-mockup relative overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-[0_0_50px_-12px_rgba(0,0,0,0.65)]">
            <div className="flex items-center gap-2 border-b border-white/10 border-t-white/10 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-3 font-mono text-[11px] tracking-wide text-white/35">
                GharKatha · Landlord
              </span>
            </div>

            <div className="grid lg:grid-cols-[200px_1fr]">
              <aside className="hidden border-r border-white/10 bg-[#0c0c0e] p-4 lg:block">
                <p className="mb-4 px-2 font-mono text-[10px] uppercase tracking-wider text-white/25">
                  Menu
                </p>
                <ul className="space-y-1 text-sm text-white/50">
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
                      className={`rounded-lg px-3 py-2 transition-colors duration-300 ${
                        i === 0
                          ? 'bg-white/10 text-white'
                          : 'hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>

              <div className="bg-[#f8f9fa] p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">Dashboard</p>
                    <p className="text-xs text-zinc-400">This month overview</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-900/10 bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-white">
                    <span className="landing-live-dot" aria-hidden="true" />
                    Live
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
                        className="rounded-xl border border-zinc-200/80 bg-white p-3 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]"
                      >
                        <div className="mb-2 flex items-center gap-1.5 text-zinc-400">
                          <Icon size={13} strokeWidth={1.5} />
                          <span className="text-[10px] tracking-wide">{m.label}</span>
                        </div>
                        <p className="text-sm font-semibold tracking-tight text-zinc-900 sm:text-base">
                          {m.value}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
                    <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      Recent Activities
                    </p>
                    <ul className="space-y-3">
                      {[
                        { name: 'Rent received from Binod Shrestha', status: 'Completed', tone: 'bg-zinc-900 text-white' },
                        { name: 'Invoice generated · Unit 3B', status: 'Completed', tone: 'bg-zinc-900 text-white' },
                        { name: 'Maintenance · Water tank leak', status: 'In Progress', tone: 'bg-zinc-100 text-zinc-700 border border-zinc-200' },
                      ].map((row) => (
                        <li key={row.name} className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm text-zinc-700">{row.name}</p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${row.tone}`}
                          >
                            {row.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-zinc-200/80 bg-white p-4">
                    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      Rent Collection
                    </p>
                    <div className="mx-auto mb-3 flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-zinc-900 border-r-zinc-100 border-b-zinc-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold tracking-tight text-zinc-900">86%</p>
                        <p className="text-[10px] text-zinc-400">Collected</p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-zinc-500">This month&apos;s collection pace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
