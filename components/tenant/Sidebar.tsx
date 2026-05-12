'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'

const navItems = [
  { href: '/tenant', label: 'Dashboard', icon: '🏠' },
  { href: '/tenant/buildings', label: 'Find Building', icon: '🔍' },
  { href: '/tenant/invoices', label: 'Invoices', icon: '🧾' },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: '🔧' },
  { href: '/tenant/settings', label: 'Settings', icon: '⚙️' },
]

export default function TenantSidebar() {
  return (
    <AppSidebar
      title="AKS Rental"
      subtitle="Tenant Portal"
      subtitleColor="text-purple-300"
      bgColor="bg-[#1a1a2e]"
      mutedColor="text-purple-100"
      navItems={navItems}
      rootHref="/tenant"
    />
  )
}
