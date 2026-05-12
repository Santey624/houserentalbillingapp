'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'
import { LayoutDashboard, Building2, Users, Mail, FileText, Wrench, Settings } from 'lucide-react'

const navItems = [
  { href: '/landlord', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/landlord/buildings', label: 'Buildings', icon: Building2 },
  { href: '/landlord/tenants', label: 'Tenants', icon: Users },
  { href: '/landlord/join-requests', label: 'Join Requests', icon: Mail },
  { href: '/landlord/invoices', label: 'Invoices', icon: FileText },
  { href: '/landlord/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/landlord/settings', label: 'Settings', icon: Settings },
]

export default function LandlordSidebar() {
  return (
    <AppSidebar
      title="AKS Rental"
      subtitle="Landlord Portal"
      navItems={navItems}
      rootHref="/landlord"
    />
  )
}
