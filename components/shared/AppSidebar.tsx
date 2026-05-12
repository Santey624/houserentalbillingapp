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

const WOBBLE = { borderRadius: '12px 3px 10px 3px / 3px 10px 3px 12px' }
const LABEL_WOBBLE = { borderRadius: '16px 4px 14px 4px / 4px 14px 4px 16px' }
const ROTATIONS = ['-0.5deg', '0.5deg', '-0.3deg', '0.7deg', '-0.6deg', '0.4deg', '-0.4deg']

export function AppSidebar({ title, subtitle, navItems, rootHref }: AppSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item, i) => {
        const isActive =
          pathname === item.href ||
          (item.href !== rootHref && pathname.startsWith(item.href))
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'nav-item-sketch flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium border-[2px]',
              isActive
                ? 'bg-[#ff4d4d] text-white border-[#2d2d2d] shadow-hard-sm'
                : 'text-[#2d2d2d] border-transparent hover:bg-[#e5e0d8] hover:border-[#2d2d2d]',
            )}
            style={isActive ? { transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})` } : undefined}
          >
            <Icon size={16} strokeWidth={2.5} className="flex-shrink-0" />
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
        className="nav-item-sketch flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#2d2d2d]/60 border-[2px] border-transparent hover:text-[#2d2d2d] hover:bg-[#e5e0d8] hover:border-[#2d2d2d] w-full"
      >
        <Bell size={16} strokeWidth={2.5} className="flex-shrink-0" />
        <span>Notifications</span>
      </Link>
      <button
        onClick={() => { onClick?.(); signOut({ callbackUrl: '/' }) }}
        className="nav-item-sketch flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-[#ff4d4d] border-[2px] border-transparent hover:bg-[#ff4d4d]/10 hover:border-[#ff4d4d] text-left w-full"
      >
        <LogOut size={16} strokeWidth={2.5} className="flex-shrink-0" />
        <span>Sign out</span>
      </button>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-[#fdfbf7] border-b-[3px] border-[#2d2d2d] flex items-center justify-between px-4 py-3">
        <span
          className="inline-block bg-[#ff4d4d] text-white px-3 py-1 border-[2px] border-[#2d2d2d] shadow-hard-sm font-heading text-base font-bold"
          style={LABEL_WOBBLE}
        >
          ✏️ {title}
        </span>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="p-2 border-[2px] border-[#2d2d2d] bg-white shadow-hard-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          style={WOBBLE}
        >
          {open
            ? <X size={18} strokeWidth={2.5} />
            : <Menu size={18} strokeWidth={2.5} />}
        </button>
      </header>

      {/* ── Mobile drawer overlay ──────────────────────────────── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30" style={{ top: 57 }}>
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-[#2d2d2d]/30"
            onClick={() => setOpen(false)}
          />
          {/* panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#fdfbf7] border-r-[3px] border-[#2d2d2d] flex flex-col shadow-hard overflow-y-auto">
            <div className="px-4 py-3 border-b-[2px] border-dashed border-[#2d2d2d]/25">
              <p className="text-xs text-[#2d2d2d]/50 italic">{subtitle}</p>
            </div>
            <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3">
              <NavLinks onClick={() => setOpen(false)} />
            </nav>
            <div className="flex flex-col gap-0.5 border-t-[2px] border-dashed border-[#2d2d2d]/25 px-3 py-3">
              <FooterLinks onClick={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <aside className="hidden md:flex md:min-h-screen md:w-60 lg:w-64 md:flex-col bg-[#fdfbf7] border-r-[3px] border-[#2d2d2d] flex-shrink-0">
        <div className="px-4 py-5 border-b-[2px] border-dashed border-[#2d2d2d]/25">
          <div
            className="inline-block bg-[#ff4d4d] text-white px-4 py-1.5 border-[3px] border-[#2d2d2d] shadow-hard-sm"
            style={LABEL_WOBBLE}
          >
            <span className="font-heading text-lg font-bold">✏️ {title}</span>
          </div>
          <p className="text-xs text-[#2d2d2d]/50 mt-2 ml-1 italic">{subtitle}</p>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
          <NavLinks />
        </nav>
        <div className="flex flex-col gap-0.5 border-t-[2px] border-dashed border-[#2d2d2d]/25 px-3 py-4">
          <FooterLinks />
        </div>
      </aside>
    </>
  )
}
