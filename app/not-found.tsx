import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold gradient-text mb-4 font-mono">404</div>
        <h2 className="text-3xl text-foreground mb-3">Page not found</h2>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-flex">
          Go home <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
