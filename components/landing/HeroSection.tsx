'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => {
      video.playbackRate = 1
      video.play().catch(() => {})
    }

    tryPlay()
    video.addEventListener('loadeddata', tryPlay)
    return () => video.removeEventListener('loadeddata', tryPlay)
  }, [])

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#09090b]">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <video
          ref={videoRef}
          className="absolute left-1/2 top-1/2 h-[115%] w-[115%] max-w-none -translate-x-[48%] -translate-y-[46%] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/hero-poster.jpg"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark vignette for contrast — video remains the visual plane */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 70% at 55% 40%, transparent 0%, rgba(9,9,11,0.45) 55%, rgba(9,9,11,0.88) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/55 to-[#09090b]/25"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#09090b]/60 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:justify-center sm:px-8 sm:pb-24 lg:pb-28">
        <div className="max-w-xl">
          <p className="landing-serif mb-4 text-4xl tracking-tight text-white sm:text-5xl lg:text-[3.75rem] animate-fade-in-up">
            GharKatha
          </p>

          <h1 className="mb-5 text-xl font-normal leading-snug tracking-tight text-white/90 sm:text-2xl lg:text-[1.75rem] animate-fade-in-up-1">
            Quiet control for serious property portfolios.
          </h1>

          <p className="mb-9 max-w-md text-[15px] leading-relaxed text-zinc-400 sm:text-base animate-fade-in-up-2">
            Nepali-calendar invoices, rent collection, and maintenance—one refined workspace for
            landlords who expect clarity.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center animate-fade-in-up-3">
            <Link href="/auth/signup" className="landing-btn-primary">
              Start Free <ArrowRight size={15} />
            </Link>
            <Link href="#how-it-works" className="landing-btn-ghost">
              See how it works
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-6 animate-fade-in-up-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a96e]">
              Trusted in Nepal
            </span>
            <span className="h-px flex-1 max-w-16 bg-white/15" aria-hidden="true" />
            <p className="text-sm text-zinc-500">Landlords · Managers · Families</p>
          </div>
        </div>
      </div>
    </section>
  )
}
