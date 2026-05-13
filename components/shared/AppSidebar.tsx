'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Bell, LogOut, Menu, X, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface AppSidebarProps {
  title: string
  subtitle: string
  navItems: NavItem[]
  rootHref: string
}

export function AppSidebar({ title, subtitle, navItems, rootHref }: AppSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
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
      <Link
        href="/notifications"
        onClick={onClick}
        className="nav-item-modern"
      >
        <Bell size={16} strokeWidth={2} className="flex-shrink-0" />
        <span>Notifications</span>
      </Link>
      <button
        onClick={() => { onClick?.(); signOut({ callbackUrl: '/' }) }}
        className="nav-item-modern w-full text-left hover:!bg-red-50 hover:!text-red-600"
      >
        <LogOut size={16} strokeWidth={2} className="flex-shrink-0" />
        <span>Sign out</span>
      </button>
    </>
  )

  const SidebarBrand = () => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white text-sm font-bold">A</span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 py-3">
        <Link href={rootHref}>
          <SidebarBrand />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
        >
          {open
            ? <X size={18} strokeWidth={2} />
            : <Menu size={18} strokeWidth={2} />}
        </button>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" style={{ top: 57 }}>
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-card border-r border-border flex flex-col shadow-xl overflow-y-auto">
            <div className="px-4 py-4 border-b border-border">
              <SidebarBrand />
            </div>
            <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
              <NavLinks onClick={() => setOpen(false)} />
            </nav>
            <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
              <FooterLinks onClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <aside className="hidden md:flex md:min-h-screen md:w-60 lg:w-64 md:flex-col bg-card border-r border-border flex-shrink-0">
        <div className="px-4 py-5 border-b border-border">
          <Link href={rootHref}>
            <SidebarBrand />
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
          <NavLinks />
        </nav>
        <div className="flex flex-col gap-0.5 border-t border-border px-3 py-4">
          <FooterLinks />
        </div>
      </aside>
    </>
  )
}
