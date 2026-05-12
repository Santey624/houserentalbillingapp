export function cn(...inputs: (string | undefined | null | false | 0)[]): string {
  return inputs.filter(Boolean).join(' ')
}

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  OVERDUE: 'Overdue',
  PAYMENT_SUBMITTED: 'Payment Submitted',
  PENDING_VERIFICATION: 'Pending Verification',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  OPEN: 'Open',
  RESOLVED: 'Resolved',
}

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ')
}

export function formatRs(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(4, '0')}`
}
