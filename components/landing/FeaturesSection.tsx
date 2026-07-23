import Link from 'next/link'
import { Building2, Users, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'

const features = [
  {
    title: 'For Landlords',
    href: '/for-landlords',
    icon: Building2,
    items: [
      'Manage buildings & units',
      'Generate Nepali-calendar invoices',
      'Track rent & electricity',
      'Verify payment proofs',
    ],
  },
  {
    title: 'For Tenants',
    href: '/for-tenants',
    icon: Users,
    items: [
      'View and download invoices',
      'Submit payment proof',
      'File maintenance requests',
      'Track request status',
    ],
  },
  {
    title: 'Built for Nepal',
    href: '/rent-management-nepal',
    icon: MapPin,
    items: [
      'Nepali calendar billing',
      'NPR currency support',
      'eSewa / Khalti / Bank transfer',
      'Multi-meter electricity',
    ],
  },
]

const steps = [
  { step: '01/', title: 'Create your account', desc: 'Sign up as a landlord or tenant in seconds.' },
  { step: '02/', title: 'Set up your property', desc: 'Add buildings, units, and invite your tenants.' },
  { step: '03/', title: 'Generate & track invoices', desc: 'Issue invoices in Nepali calendar with one click.' },
]

const testimonials = [
  {
    quote:
      'Before GharKatha I chased rent on WhatsApp every month. Now invoices go out in Ashadh, and payments come with proof attached.',
    name: 'Rajesh K.',
    title: 'Property Owner, Kathmandu',
    initials: 'RK',
  },
  {
    quote:
      'My tenants finally understand their bills. Nepali calendar months, electricity meters, everything in one place.',
    name: 'Suman P.',
    title: 'Landlord, Lalitpur',
    initials: 'SP',
  },
  {
    quote:
      'We manage three buildings. Join requests, unit assignment, and maintenance used to be chaos. This feels like a real office.',
    name: 'Anisha M.',
    title: 'Building Manager, Pokhara',
    initials: 'AM',
  },
]

export default function FeaturesSection() {
  return (
    <>
      <section id="features" className="bg-[#f8f9fa] px-5 py-20 sm:px-8 sm:py-28 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              Features
            </p>
            <h2 className="text-3xl leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem]">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="landing-bento rounded-2xl p-7">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-4 text-xl font-semibold tracking-tight text-zinc-900">
                    {card.title}
                  </h3>
                  <ul className="mb-6 space-y-2.5">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-500">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-zinc-300" strokeWidth={1.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-800 transition-colors duration-300 hover:text-zinc-950"
                  >
                    Learn more <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-5 py-20 sm:px-8 sm:py-28 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              How it works
            </p>
            <h2 className="text-3xl leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem]">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((s) => (
              <div key={s.step} className="border-t border-zinc-200 pt-6">
                <div className="mb-4 font-mono text-sm tracking-wide text-zinc-400">{s.step}</div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight text-zinc-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fa] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              Trusted by Landlords
            </p>
            <h2 className="text-3xl leading-[1.15] tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.65rem]">
              Real People. Real Results.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="landing-bento rounded-2xl p-6">
                <blockquote className="mb-6 text-[15px] leading-relaxed text-zinc-600">
                  “{t.quote}”
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-700"
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.title}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
