import { MessageSquareWarning, CalendarX2, Banknote } from 'lucide-react'

const problems = [
  {
    icon: Banknote,
    title: 'Rent collection is manual.',
    description:
      'Spreadsheets and WhatsApp reminders eat hours every month—and still miss late payers.',
    tone: 'text-rose-600 bg-rose-50',
  },
  {
    icon: MessageSquareWarning,
    title: 'Maintenance gets lost in chats.',
    description:
      'Leaky taps and broken meters disappear into group chats. No owner, no status, no trail.',
    tone: 'text-orange-600 bg-orange-50',
  },
  {
    icon: CalendarX2,
    title: "Invoices don't match the Nepali calendar.",
    description:
      'Gregorian tools force awkward workarounds. Tenants expect Ashadh and Shrawan—not June.',
    tone: 'text-emerald-700 bg-emerald-50',
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-28" id="problem">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            The Problem
          </p>
          <h2 className="mb-5 max-w-md text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.65rem]">
            Owning Property Shouldn&apos;t Feel Like Managing{' '}
            <span className="landing-squiggle">Chaos</span>.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
            Nepali landlords juggle buildings, tenants, and cash across tools that were never built
            for how rent actually works here.
          </p>
        </div>

        <ul className="space-y-4">
          {problems.map((item) => {
            const Icon = item.icon
            return (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.tone}`}
                >
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="mb-1 text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
