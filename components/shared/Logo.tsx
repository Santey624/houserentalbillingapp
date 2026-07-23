import Image from 'next/image'

/** Wordmark aspect ratio from brand asset (2172×724). */
const LOGO_ASPECT = 2172 / 724

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
  showTagline = false,
  height: heightProp,
  className,
}: {
  showTagline?: boolean
  height?: number
  className?: string
}) {
  const height = heightProp ?? (showTagline ? 52 : 40)
  return (
    <Image
      src="/gharkatha-logo-light.png"
      alt={showTagline ? 'GharKatha Smart Rent Management' : 'GharKatha'}
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      className={className}
      priority
    />
  )
}
