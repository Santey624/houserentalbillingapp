import { cn, formatStatus } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PAID:                 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAYMENT_SUBMITTED:    'bg-blue-50 text-blue-700 border-blue-200',
  OVERDUE:              'bg-red-50 text-red-700 border-red-200',
  UNPAID:               'bg-slate-100 text-slate-600 border-slate-200',
  PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED:             'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED:             'bg-red-50 text-red-700 border-red-200',
  PENDING:              'bg-sky-50 text-sky-700 border-sky-200',
  APPROVED:             'bg-emerald-50 text-emerald-700 border-emerald-200',
  OPEN:                 'bg-orange-50 text-orange-700 border-orange-200',
  IN_PROGRESS:          'bg-blue-50 text-blue-700 border-blue-200',
  RESOLVED:             'bg-slate-100 text-slate-500 border-slate-200',
  CLOSED:               'bg-slate-100 text-slate-500 border-slate-200',
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
        STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border-slate-200',
      )}
    >
      {formatStatus(status)}
    </span>
  )
}
