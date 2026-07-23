import { cn, formatStatus } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PAID:                 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  PAYMENT_SUBMITTED:    'bg-[#c9a96e]/10 text-[#dbbf8a] border-[#c9a96e]/25',
  OVERDUE:              'bg-red-500/10 text-red-300 border-red-500/25',
  UNPAID:               'bg-zinc-500/10 text-zinc-300 border-zinc-500/25',
  PENDING_VERIFICATION: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  VERIFIED:             'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  REJECTED:             'bg-red-500/10 text-red-300 border-red-500/25',
  PENDING:              'bg-sky-500/10 text-sky-300 border-sky-500/25',
  APPROVED:             'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  OPEN:                 'bg-orange-500/10 text-orange-300 border-orange-500/25',
  IN_PROGRESS:          'bg-[#c9a96e]/10 text-[#dbbf8a] border-[#c9a96e]/25',
  RESOLVED:             'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
  CLOSED:               'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
}

interface Props {
  status: string
  size?: 'sm' | 'base'
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        size === 'base' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs',
        STATUS_STYLES[status] ?? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/25',
      )}
    >
      {formatStatus(status)}
    </span>
  )
}
