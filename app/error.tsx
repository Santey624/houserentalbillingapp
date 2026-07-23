'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
        <h2 className="text-3xl text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          An unexpected error occurred. Please try again or go back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary inline-flex">
            <RotateCcw size={14} />
            Try again
          </button>
          <Link href="/" className="btn-secondary inline-flex">
            Go home <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
