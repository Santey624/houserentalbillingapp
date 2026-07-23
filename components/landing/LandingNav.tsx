'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Logo, LogoDark } from '@/components/shared/Logo'

const links = [
  { label: 'Solutions', href: '#solution' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '/about' },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        solid
          ? 'border-b border-zinc-200/80 bg-[#f8f9fa]/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" aria-label="GharKatha home" className="relative z-10">
          {solid ? <Logo height={42} /> : <LogoDark height={42} />}
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                solid
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-white/75 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            href="/auth/signin"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-300 ${
              solid ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/80 hover:text-white'
            }`}
          >
            Log in
          </Link>
          {solid ? (
            <Link href="/auth/signup" className="landing-btn-solid h-10 px-5 text-sm">
              Start Free <ArrowRight size={14} />
            </Link>
          ) : (
            <Link href="/auth/signup" className="landing-btn-primary h-10 px-5 text-sm">
              Start Free <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`rounded-lg p-2 transition-colors duration-300 lg:hidden ${
            solid ? 'text-zinc-900' : 'text-white'
          }`}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-zinc-200 bg-[#f8f9fa] px-5 py-6 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-base font-medium text-zinc-900 hover:bg-zinc-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-200 text-sm font-medium text-zinc-800"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="landing-btn-solid h-11 w-full"
              onClick={() => setOpen(false)}
            >
              Start Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
