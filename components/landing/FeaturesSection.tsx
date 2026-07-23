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
  { step: '01', title: 'Create your account', desc: 'Sign up as a landlord or tenant in seconds.' },
  { step: '02', title: 'Set up your property', desc: 'Add buildings, units, and invite your tenants.' },
  { step: '03', title: 'Generate & track invoices', desc: 'Issue invoices in Nepali calendar with one click.' },
]

const testimonials = [
  {
    quote:
      'Before GharKatha I chased rent on WhatsApp every month. Now invoices go out in Ashadh, and payments come with proof attached.',
    name: 'Rajesh K.',
    title: 'Property Owner, Kathmandu',
    initials: 'RK',
    color: '#1E3A8A',
  },
  {
    quote:
      'My tenants finally understand their bills. Nepali calendar months, electricity meters, everything in one place.',
    name: 'Suman P.',
    title: 'Landlord, Lalitpur',
    initials: 'SP',
    color: '#0F766E',
  },
  {
    quote:
      'We manage three buildings. Join requests, unit assignment, and maintenance used to be chaos. This feels like a real office.',
    name: 'Anisha M.',
    title: 'Building Manager, Pokhara',
    initials: 'AM',
    color: '#9A3412',
  },
]

export default function FeaturesSection() {
  return (
    <>
      <section id="features" className="bg-slate-50 px-5 py-20 sm:px-8 sm:py-28 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Features
            </p>
            <h2 className="text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.65rem]">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((card, i) => {
              const Icon = card.icon
              const featured = i === 0
              return (
                <div
                  key={card.title}
                  className={featured ? 'card-gradient-border' : 'rounded-2xl border border-slate-200 bg-white shadow-sm'}
                >
                  <div className={featured ? 'card-gradient-border-inner p-7' : 'p-7'}>
                    <div
                      className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${
                        featured ? 'gradient-bg' : 'bg-slate-100'
                      }`}
                    >
                      <Icon size={20} className={featured ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">{card.title}</h3>
                    <ul className="mb-6 space-y-2.5">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                          <CheckCircle2
                            size={14}
                            className={`mt-0.5 shrink-0 ${featured ? 'text-accent' : 'text-slate-300'}`}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-2"
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-5 py-20 sm:px-8 sm:py-28 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              How it works
            </p>
            <h2 className="text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.65rem]">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step}>
                <div className="mb-4 font-mono text-4xl font-bold gradient-text">{s.step}</div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Trusted by Landlords
            </p>
            <h2 className="text-3xl leading-[1.15] text-slate-900 sm:text-4xl lg:text-[2.65rem]">
              Real People. Real Results.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <blockquote className="mb-6 text-[15px] leading-relaxed text-slate-600">
                  “{t.quote}”
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: t.color }}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.title}</p>
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
