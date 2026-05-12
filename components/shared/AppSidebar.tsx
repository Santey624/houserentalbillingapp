'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface AppSidebarProps {
  title: string
  subtitle: string
  subtitleColor: string
  bgColor: string
  mutedColor: string
  navItems: NavItem[]
  rootHref: string
}

export function AppSidebar({
  title,
  subtitle,
  subtitleColor,
  bgColor,
  mutedColor,
  navItems,
  rootHref,
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn('w-full text-white md:flex md:min-h-screen md:w-64 md:flex-col', bgColor)}>
      <div className="border-b border-white/10 px-4 py-4 sm:px-6 md:py-5">
        <span className="text-xl font-bold tracking-wide">{title}</span>
        <p className={cn('mt-0.5 text-xs', subtitleColor)}>{subtitle}</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible md:py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== rootHref && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition md:gap-3',
                isActive
                  ? 'bg-white/20 font-semibold'
                  : cn(mutedColor, 'hover:bg-white/10'),
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex gap-2 border-t border-white/10 px-3 py-3 md:block md:space-y-2 md:px-4 md:py-4">
        <Link
          href="/notifications"
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 md:gap-3',
            mutedColor,
          )}
        >
          <span aria-hidden="true">🔔</span> Notifications
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 transition hover:bg-white/10 md:w-full md:gap-3"
        >
          <span aria-hidden="true">🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
