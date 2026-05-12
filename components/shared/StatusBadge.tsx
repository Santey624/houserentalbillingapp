import { cn, formatStatus } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PAID: 'bg-[#d4f5d4] text-[#1a5c1a] border-[#1a5c1a]',
  PAYMENT_SUBMITTED: 'bg-[#d4e4f5] text-[#2d5da1] border-[#2d5da1]',
  OVERDUE: 'bg-[#ff4d4d]/15 text-[#cc0000] border-[#cc0000]',
  UNPAID: 'bg-[#e5e0d8] text-[#2d2d2d] border-[#2d2d2d]',
  PENDING_VERIFICATION: 'bg-[#fff9c4] text-[#7a6500] border-[#7a6500]',
  VERIFIED: 'bg-[#d4f5d4] text-[#1a5c1a] border-[#1a5c1a]',
  REJECTED: 'bg-[#ff4d4d]/15 text-[#cc0000] border-[#cc0000]',
  PENDING: 'bg-[#d4e4f5] text-[#2d5da1] border-[#2d5da1]',
  APPROVED: 'bg-[#d4f5d4] text-[#1a5c1a] border-[#1a5c1a]',
  OPEN: 'bg-[#ff4d4d]/15 text-[#cc0000] border-[#cc0000]',
  IN_PROGRESS: 'bg-[#fff9c4] text-[#7a6500] border-[#7a6500]',
  RESOLVED: 'bg-[#e5e0d8] text-[#2d2d2d] border-[#2d2d2d]',
}

interface Props {
  status: string
  size?: 'sm' | 'base'
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  return (
    <span
      className={cn(
        'inline-block border-[2px] font-medium',
        size === 'base' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs',
        STATUS_STYLES[status] ?? 'bg-[#e5e0d8] text-[#2d2d2d] border-[#2d2d2d]',
      )}
      style={{ borderRadius: '50px 30px 40px 35px / 30px 45px 25px 40px' }}
    >
      {formatStatus(status)}
    </span>
  )
}
