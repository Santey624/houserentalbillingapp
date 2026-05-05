'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/landlord', label: 'Dashboard', icon: '🏠' },
  { href: '/landlord/buildings', label: 'Buildings', icon: '🏢' },
  { href: '/landlord/tenants', label: 'Tenants', icon: '👥' },
  { href: '/landlord/join-requests', label: 'Join Requests', icon: '📬' },
  { href: '/landlord/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/landlord/maintenance', label: 'Maintenance', icon: '🔧' },
  { href: '/landlord/settings', label: 'Settings', icon: '⚙️' },
]

export default function LandlordSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#0f3460] text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-wide">AKS Rental</span>
        <p className="text-xs text-blue-300 mt-0.5">Landlord Portal</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/landlord' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                isActive
                  ? 'bg-white/20 font-semibold'
                  : 'text-blue-100 hover:bg-white/10'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 transition"
        >
          <span>🔔</span> Notifications
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-white/10 transition text-left"
        >
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  )
}
