import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { LogoDark } from '@/components/shared/Logo'

export function FinalCta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-[#09090b] px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(201,169,110,0.22), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="mb-5 text-3xl leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
          Ready to modernize your properties?
        </h2>
        <p className="mb-10 text-base text-zinc-400 sm:text-lg">
          Join landlords across Nepal who collect rent, invoice in Nepali months, and run buildings
          without the chaos.
        </p>
        <Link href="/auth/signup" className="landing-btn-primary">
          Start Managing Today <ArrowRight size={16} />
        </Link>
        <p className="mt-5 text-sm text-zinc-600">
          No credit card required. Free forever plan available.
        </p>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-[#050506]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 border-b border-white/[0.07] px-5 pb-12 pt-16 sm:px-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <LogoDark showTagline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-500">
            Nepal&apos;s modern rental management platform — built for landlords and tenants across
            the country.
          </p>
          <div className="mt-6 flex items-center gap-1.5">
            <MapPin size={12} className="text-zinc-600" />
            <span className="text-xs text-zinc-600">Made in Nepal</span>
          </div>
        </div>

        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Product
          </p>
          <ul className="space-y-3.5">
            {[
              { label: 'For Landlords', href: '/for-landlords' },
              { label: 'For Tenants', href: '/for-tenants' },
              { label: 'Features', href: '/#features' },
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'About GharKatha', href: '/about' },
              { label: 'Rent Management Nepal', href: '/rent-management-nepal' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-zinc-500 transition-colors duration-300 hover:text-zinc-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
            Account
          </p>
          <ul className="space-y-3.5">
            {[
              { label: 'Sign In', href: '/auth/signin' },
              { label: 'Create Account', href: '/auth/signup' },
              { label: 'Reset Password', href: '/auth/reset' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-zinc-500 transition-colors duration-300 hover:text-zinc-300"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 font-mono text-[11px] uppercase tracking-widest text-zinc-500">Legal</p>
          <ul className="space-y-3.5">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((label) => (
              <li key={label}>
                <span className="text-sm text-zinc-600">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-8">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} GharKatha (घरकथा). All rights reserved.
        </p>
        <p className="text-xs tracking-wide text-zinc-700">Designed &amp; built in Nepal</p>
      </div>
    </footer>
  )
}
