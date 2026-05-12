'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'
import { LayoutDashboard, Search, FileText, Wrench, Settings } from 'lucide-react'

const navItems = [
  { href: '/tenant', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tenant/buildings', label: 'Find Building', icon: Search },
  { href: '/tenant/invoices', label: 'Invoices', icon: FileText },
  { href: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/tenant/settings', label: 'Settings', icon: Settings },
]

export default function TenantSidebar() {
  return (
    <AppSidebar
      title="AKS Rental"
      subtitle="Tenant Portal"
      navItems={navItems}
      rootHref="/tenant"
    />
  )
}
