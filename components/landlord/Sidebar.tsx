'use client'

import { AppSidebar } from '@/components/shared/AppSidebar'

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
  return (
    <AppSidebar
      title="AKS Rental"
      subtitle="Landlord Portal"
      subtitleColor="text-blue-300"
      bgColor="bg-[#0f3460]"
      mutedColor="text-blue-100"
      navItems={navItems}
      rootHref="/landlord"
    />
  )
}
