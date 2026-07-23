'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Bell, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { LogoDark } from '@/components/shared/Logo'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface AppSidebarProps {
  subtitle: string
  navItems: NavItem[]
  rootHref: string
}

function SidebarBrand({ subtitle, rootHref }: { subtitle: string; rootHref: string }) {
  return (
    <Link href={rootHref} className="flex flex-col gap-1">
      <LogoDark height={40} />
      <p className="text-xs text-muted-foreground pl-0.5">{subtitle}</p>
    </Link>
  )
}

export function AppSidebar({ subtitle, navItems, rootHref }: AppSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== rootHref && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn('nav-item-modern', isActive && 'active')}
          >
            <Icon size={16} strokeWidth={2} className="flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  const FooterLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link href="/notifications" onClick={onClick} className="nav-item-modern">
        <Bell size={16} strokeWidth={2} className="flex-shrink-0" />
        <span>Notifications</span>
      </Link>
      <button
        type="button"
        onClick={() => {
          onClick?.()
          signOut({ callbackUrl: '/' })
        }}
        className="nav-item-modern w-full text-left hover:!bg-red-500/10 hover:!text-red-300"
      >
        <LogOut size={16} strokeWidth={2} className="flex-shrink-0" />
        <span>Sign out</span>
      </button>
    </>
  )

  return (
    <>
      {/* Mobile-only chrome */}
      <div className="md:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <SidebarBrand subtitle={subtitle} rootHref={rootHref} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="rounded-lg border border-border bg-card p-2 transition-colors hover:bg-muted"
          >
            {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </header>

        {open && (
          <div className="fixed inset-0 z-30" style={{ top: 57 }}>
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="relative flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-border bg-card shadow-xl">
              <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
                <NavLinks onClick={() => setOpen(false)} />
              </nav>
              <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
                <FooterLinks onClick={() => setOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop-only sidebar */}
      <aside className="hidden md:flex md:min-h-screen md:w-60 md:flex-shrink-0 md:flex-col md:border-r md:border-border md:bg-card lg:w-64">
        <div className="border-b border-border px-4 py-5">
          <SidebarBrand subtitle={subtitle} rootHref={rootHref} />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          <NavLinks />
        </nav>
        <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
          <FooterLinks />
        </div>
      </aside>
    </>
  )
}
