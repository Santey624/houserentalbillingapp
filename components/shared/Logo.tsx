import Image from 'next/image'

/** Wordmark aspect ratio from brand asset (1200×400). */
const LOGO_ASPECT = 1200 / 400

export function Logo({ height = 32, className }: { height?: number; className?: string }) {
  return (
    <Image
      src="/gharkatha-logo.png"
      alt="GharKatha"
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      className={className}
      priority
    />
  )
}

export function LogoDark({
  height,
  showTagline = false,
  className,
}: {
  height?: number
  showTagline?: boolean
  className?: string
}) {
  const resolvedHeight = height ?? (showTagline ? 52 : 40)
  return (
    <Image
      src="/gharkatha-logo-light.png"
      alt={showTagline ? 'GharKatha Smart Rent Management' : 'GharKatha'}
      width={Math.round(resolvedHeight * LOGO_ASPECT)}
      height={resolvedHeight}
      className={className}
      priority
    />
  )
}
