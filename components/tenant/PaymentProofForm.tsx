'use client'

import { useActionState, useState } from 'react'
import { submitPaymentProofAction } from '@/app/actions/payments'
import { CheckCircle2, CreditCard } from 'lucide-react'

interface Props {
  invoiceId: string
  grandTotal: number
}

export default function PaymentProofForm({ invoiceId, grandTotal }: Props) {
  const [state, action, pending] = useActionState(submitPaymentProofAction, null)
  const [showForm, setShowForm] = useState(false)

  if (state?.message) {
    return (
      <div className="alert-success">
        <CheckCircle2 size={16} className="flex-shrink-0" />
        {state.message}
      </div>
    )
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="btn-primary w-full h-12">
        <CreditCard size={16} />
        I&apos;ve Paid — Submit Proof
      </button>
    )
  }

  return (
    <div className="card-modern p-6 space-y-4">
      <h3 className="font-semibold text-foreground">Submit Payment Proof</h3>
      <form action={action} className="space-y-4">
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <input type="hidden" name="amount" value={grandTotal} />

        <div>
          <label className="field-label">Payment Method</label>
          <select name="method" required className="select-modern">
            <option value="ESEWA">eSewa</option>
            <option value="KHALTI">Khalti</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
          </select>
          {state?.errors?.method && <p className="field-error">{state.errors.method[0]}</p>}
        </div>

        <div>
          <label className="field-label">Reference Number (optional)</label>
          <input name="referenceNum" type="text" className="input-modern" placeholder="Transaction ID or reference" />
        </div>

        <div>
          <label className="field-label">Payment Screenshot / Proof</label>
          <input
            name="proof"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border file:border-border file:bg-muted file:text-foreground file:text-xs file:cursor-pointer hover:file:bg-muted/80 transition-colors"
          />
        </div>

        {state?.errors && (
          <div className="alert-error">
            <div>
              {Object.values(state.errors).flat().map((m, i) => (
                <p key={i} className="text-sm">{m}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn-primary flex-1 h-10">
            {pending ? 'Submitting...' : 'Submit Proof'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-4">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
