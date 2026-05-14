import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Building2, ArrowRight, CheckCircle2, Users, MapPin } from 'lucide-react'
import { Logo, LogoDark } from '@/components/shared/Logo'

export default async function LandingPage() {
  const session = await auth()

  if (session?.user) {
    redirect(session.user.role === 'LANDLORD' ? '/landlord' : '/tenant')
  }

  const features = [
    {
      title: 'For Landlords',
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

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo height={56} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="btn-ghost hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="flex-1 py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="section-label mb-6 animate-fade-in-up">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-dot" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
                Made for Nepal
              </span>
            </div>

            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[5.25rem] leading-[1.05] tracking-tight text-foreground mb-6 animate-fade-in-up-1">
              Rental Management<br />
              for Nepal, Made{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Simple</span>
                <span
                  className="absolute left-0 w-full rounded-sm"
                  style={{
                    bottom: '-0.25rem',
                    height: '0.6rem',
                    background: 'linear-gradient(to right, rgba(0,82,255,0.15), rgba(77,124,255,0.08))',
                  }}
                />
              </span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mb-10 animate-fade-in-up-2">
              Manage buildings, generate invoices in Nepali calendar, track payments,
              and handle maintenance — all in one clean platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up-3">
              <Link
                href="/auth/signup?role=LANDLORD"
                className="btn-primary h-14 px-8 text-base"
              >
                I&apos;m a Landlord
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/signup?role=TENANT"
                className="btn-secondary h-14 px-8 text-base"
              >
                I&apos;m a Tenant
              </Link>
            </div>
          </div>

          {/* Right: abstract graphic */}
          <div className="hidden lg:block relative animate-fade-in-up-2">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full animate-spin-slow"
                style={{
                  border: '1.5px dashed rgba(0,82,255,0.2)',
                }}
              />
              {/* Inner glow */}
              <div
                className="absolute inset-10 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(0,82,255,0.08) 0%, transparent 70%)',
                }}
              />

              {/* Main floating invoice card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-float w-52">
                <div className="card-modern p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-muted-foreground">INV-2081-06</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Paid</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">House Rent</p>
                  <p className="text-xs text-muted-foreground mb-3">Ashadh 2081</p>
                  <div className="h-px bg-border mb-3" />
                  <p className="text-xl font-semibold text-foreground">Rs. 18,500</p>
                </div>
              </div>

              {/* Top-right accent block */}
              <div className="absolute top-8 right-8 w-12 h-12 rounded-xl gradient-bg shadow-lg" style={{ boxShadow: '0 8px 24px rgba(0,82,255,0.35)' }} />

              {/* Bottom-left stats card */}
              <div className="absolute bottom-10 left-4 animate-float-delayed">
                <div className="card-modern px-4 py-3 shadow-lg">
                  <p className="text-xs text-muted-foreground mb-1">Buildings</p>
                  <p className="text-2xl font-semibold text-foreground">12</p>
                </div>
              </div>

              {/* Top-left dot grid */}
              <div className="absolute top-6 left-6 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-border" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ──────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-5 inline-flex">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
                Features
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] text-foreground">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((card, i) => {
              const Icon = card.icon
              const isFeatured = i === 0
              return isFeatured ? (
                <div key={card.title} className="card-gradient-border">
                  <div className="card-gradient-border-inner p-7">
                    <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center mb-5 shadow-md" style={{ boxShadow: '0 4px 14px rgba(0,82,255,0.25)' }}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">{card.title}</h3>
                    <ul className="space-y-2.5">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} className="text-accent flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div key={card.title} className="card-modern card-modern-hover p-7">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-5">
                    <Icon size={20} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{card.title}</h3>
                  <ul className="space-y-2.5">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 size={14} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="section-label mb-5 inline-flex">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
                How it works
              </span>
            </div>
            <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] text-foreground">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="text-4xl font-mono font-bold gradient-text mb-4">{s.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dark CTA section ───────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8 bg-foreground relative overflow-hidden">
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 opacity-10"
          style={{ background: 'radial-gradient(ellipse, #0052FF, transparent)', filter: 'blur(60px)' }}
        />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-[3.25rem] leading-[1.15] text-white mb-5">
            Ready to get{' '}
            <span className="gradient-text">started?</span>
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Join landlords and tenants already using GharKhata.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary h-14 px-10 text-base">
              Create Free Account
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth/signin" className="btn-secondary h-14 px-10 text-base" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-foreground">
        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 border-b border-white/[0.07]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <LogoDark showTagline />
            <p className="text-white/40 text-sm leading-relaxed mt-5 max-w-xs">
              Nepal&apos;s modern rental management platform — built for landlords and tenants across the country.
            </p>
            <div className="flex items-center gap-1.5 mt-6">
              <MapPin size={12} className="text-white/25" />
              <span className="text-white/25 text-xs">Made in Nepal</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-white/55 font-semibold text-xs uppercase tracking-widest mb-5">Product</p>
            <ul className="space-y-3.5">
              {[
                { label: 'For Landlords', href: '/auth/signup?role=LANDLORD' },
                { label: 'For Tenants', href: '/auth/signup?role=TENANT' },
                { label: 'Features', href: '#' },
                { label: 'Pricing', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/35 hover:text-white/65 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-white/55 font-semibold text-xs uppercase tracking-widest mb-5">Account</p>
            <ul className="space-y-3.5">
              {[
                { label: 'Sign In', href: '/auth/signin' },
                { label: 'Create Account', href: '/auth/signup' },
                { label: 'Reset Password', href: '/auth/reset' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/35 hover:text-white/65 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white/55 font-semibold text-xs uppercase tracking-widest mb-5">Legal</p>
            <ul className="space-y-3.5">
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((label) => (
                <li key={label}>
                  <span className="text-white/35 text-sm">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} GharKhata (घरखाता). All rights reserved.
          </p>
          <p className="text-white/20 text-xs tracking-wide">
            Designed &amp; built in Nepal 🇳🇵
          </p>
        </div>
      </footer>
    </main>
  )
}
