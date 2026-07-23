import { MessageSquareWarning, CalendarX2, Banknote } from 'lucide-react'

const problems = [
  {
    icon: Banknote,
    title: 'Rent collection is manual.',
    description:
      'Spreadsheets and WhatsApp reminders eat hours every month—and still miss late payers.',
  },
  {
    icon: MessageSquareWarning,
    title: 'Maintenance gets lost in chats.',
    description:
      'Leaky taps and broken meters disappear into group chats. No owner, no status, no trail.',
  },
  {
    icon: CalendarX2,
    title: "Invoices don't match the Nepali calendar.",
    description:
      'Gregorian tools force awkward workarounds. Tenants expect Ashadh and Shrawan—not June.',
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-[#f8f9fa] px-5 py-20 sm:px-8 sm:py-28" id="problem">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
            The Problem
          </p>
          <h2 className="mb-5 max-w-md text-3xl leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem]">
            Owning Property Shouldn&apos;t Feel Like Managing{' '}
            <em className="landing-serif italic text-[#c9a96e]">Chaos</em>.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-zinc-500 sm:text-lg">
            Nepali landlords juggle buildings, tenants, and cash across tools that were never built
            for how rent actually works here.
          </p>
        </div>

        <ul className="space-y-3">
          {problems.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.title}
                className="group flex gap-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.35)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors duration-300 group-hover:border-zinc-300 group-hover:bg-white">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-zinc-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{item.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
