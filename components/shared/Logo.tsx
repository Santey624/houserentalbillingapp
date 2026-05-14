import Image from 'next/image'

export function Logo({ height = 32, className }: { height?: number; className?: string }) {
  return (
    <Image
      src="/gharkhata-logo.png"
      alt="GharKhata"
      width={Math.round(height * 3.08)}
      height={height}
      className={className}
      priority
    />
  )
}

export function LogoDark({ showTagline = false }: { showTagline?: boolean }) {
  return (
    <Image
      src="/gharkhata-logo-light.png"
      alt={showTagline ? 'GharKhata Smart Rent Management' : 'GharKhata'}
      width={Math.round((showTagline ? 52 : 40) * 3.08)}
      height={showTagline ? 52 : 40}
      priority
    />
  )
}
