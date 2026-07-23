import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { LogoDark } from '@/components/shared/Logo'

export function FinalCta() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden bg-[#0A0F1E] px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(0,82,255,0.4), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-20"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'160\' height=\'40\' viewBox=\'0 0 160 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 28 Q40 8 80 28 T160 28\' fill=\'none\' stroke=\'white\' stroke-width=\'1.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="mb-5 text-3xl leading-[1.15] text-white sm:text-4xl lg:text-[2.65rem]">
          Ready to modernize your properties?
        </h2>
        <p className="mb-10 text-base text-white/55 sm:text-lg">
          Join landlords across Nepal who collect rent, invoice in Nepali months, and run buildings
          without the chaos.
        </p>
        <Link href="/auth/signup" className="btn-primary h-12 rounded-full px-8 text-base">
          Start Managing Today <ArrowRight size={16} />
        </Link>
        <p className="mt-5 text-sm text-white/35">
          No credit card required. Free forever plan available.
        </p>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="bg-[#070b16]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 border-b border-white/[0.07] px-5 pb-12 pt-16 sm:px-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <LogoDark showTagline />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/40">
            Nepal&apos;s modern rental management platform — built for landlords and tenants across
            the country.
          </p>
          <div className="mt-6 flex items-center gap-1.5">
            <MapPin size={12} className="text-white/25" />
            <span className="text-xs text-white/25">Made in Nepal</span>
          </div>
        </div>

        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/55">Product</p>
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
                <Link href={href} className="text-sm text-white/35 transition-colors hover:text-white/65">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/55">Account</p>
          <ul className="space-y-3.5">
            {[
              { label: 'Sign In', href: '/auth/signin' },
              { label: 'Create Account', href: '/auth/signup' },
              { label: 'Reset Password', href: '/auth/reset' },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="text-sm text-white/35 transition-colors hover:text-white/65">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/55">Legal</p>
          <ul className="space-y-3.5">
            {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((label) => (
              <li key={label}>
                <span className="text-sm text-white/35">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 sm:flex-row sm:px-8">
        <p className="text-xs text-white/25">
          &copy; {new Date().getFullYear()} GharKatha (घरकथा). All rights reserved.
        </p>
        <p className="text-xs tracking-wide text-white/20">Designed &amp; built in Nepal</p>
      </div>
    </footer>
  )
}
