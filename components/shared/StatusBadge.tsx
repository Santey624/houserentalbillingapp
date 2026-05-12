import { cn, formatStatus } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PAYMENT_SUBMITTED: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
  UNPAID: 'bg-gray-100 text-gray-600',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  PENDING: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  OPEN: 'bg-orange-100 text-orange-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-gray-100 text-gray-600',
}

interface Props {
  status: string
  size?: 'sm' | 'base'
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  return (
    <span
      className={cn(
        'rounded-full font-medium',
        size === 'base' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs',
        STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600',
      )}
    >
      {formatStatus(status)}
    </span>
  )
}
