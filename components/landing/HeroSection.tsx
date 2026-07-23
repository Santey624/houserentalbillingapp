'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Play at native 1x — slow-mo is baked into the encoded file for smooth playback.
    const tryPlay = () => {
      video.playbackRate = 1
      video.play().catch(() => {})
    }

    tryPlay()
    video.addEventListener('loadeddata', tryPlay)
    return () => video.removeEventListener('loadeddata', tryPlay)
  }, [])

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0A0F1E]">
      {/* Crop wrapper + corner mask hide any residual watermark */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          className="absolute left-1/2 top-1/2 h-[112%] w-[112%] max-w-none -translate-x-[46%] -translate-y-[44%] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute bottom-0 right-0 h-24 w-40 bg-gradient-to-tl from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" />
      </div>

      {/* Soft readability overlays — keep video visible */}
      <div className="absolute inset-0 bg-[#0A0F1E]/55 sm:bg-[#0A0F1E]/45" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0A0F1E]/80 via-[#0A0F1E]/35 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8 lg:pb-24">
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B8CFF] animate-fade-in-up">
            Property Management
          </p>

          <h1 className="mb-6 font-heading text-[2.5rem] leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] animate-fade-in-up-1">
            Built for Modern{' '}
            <span className="text-[#4D7CFF]">Nepal</span>.
          </h1>

          <p className="mb-9 max-w-md text-base leading-relaxed text-white/75 sm:text-lg animate-fade-in-up-2">
            Manage tenants, collect rent, generate Nepali-calendar invoices, track maintenance, and
            grow your properties—all from one intelligent platform.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up-3">
            <Link href="/auth/signup" className="btn-primary h-12 px-7 text-sm">
              Start Free <ArrowRight size={15} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/30 bg-white/5 px-6 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Play size={10} fill="currentColor" />
              </span>
              Book Demo
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up-4">
            <div className="flex -space-x-2.5" aria-hidden="true">
              {['#1E3A8A', '#0F766E', '#9A3412', '#6D28D9'].map((color, i) => (
                <span
                  key={color}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0A0F1E] text-[10px] font-semibold text-white"
                  style={{ backgroundColor: color, zIndex: 4 - i }}
                >
                  {['RK', 'SP', 'AM', 'NT'][i]}
                </span>
              ))}
            </div>
            <div>
              <div className="mb-0.5 flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M10 1.5l2.35 4.76 5.25.76-3.8 3.7.9 5.24L10 13.77l-4.7 2.47.9-5.24-3.8-3.7 5.25-.76L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-white/60">Trusted by landlords across Nepal</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-white/45">
            Prefer a role-specific start?{' '}
            <Link href="/auth/signup?role=LANDLORD" className="text-white/80 underline-offset-2 hover:underline">
              Landlord
            </Link>
            {' · '}
            <Link href="/auth/signup?role=TENANT" className="text-white/80 underline-offset-2 hover:underline">
              Tenant
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
