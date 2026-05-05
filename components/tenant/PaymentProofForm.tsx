'use client'

import { useActionState, useState } from 'react'
import { submitPaymentProofAction } from '@/app/actions/payments'

interface Props {
  invoiceId: string
  grandTotal: number
}

export default function PaymentProofForm({ invoiceId, grandTotal }: Props) {
  const [state, action, pending] = useActionState(submitPaymentProofAction, null)
  const [showForm, setShowForm] = useState(false)

  if (state?.message) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-green-700 text-sm">
        {state.message}
      </div>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-[#0f3460] text-white py-3 rounded-xl font-semibold hover:bg-[#0f3460]/90 transition"
      >
        I&apos;ve Paid — Submit Proof
      </button>
    )
  }

  return (
    <form action={action} encType="multipart/form-data" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Submit Payment Proof</h3>
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="amount" value={grandTotal} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <select name="method" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]">
          <option value="ESEWA">eSewa</option>
          <option value="KHALTI">Khalti</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
        </select>
        {state?.errors?.method && <p className="text-red-600 text-xs mt-1">{state.errors.method[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number (optional)</label>
        <input name="referenceNum" type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3460]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot / Proof</label>
        <input name="proof" type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#0f3460] file:text-white file:text-xs" />
      </div>

      {state?.errors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {Object.values(state.errors).flat().map((m, i) => (
            <p key={i} className="text-red-700 text-xs">{m}</p>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-[#0f3460] text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
        >
          {pending ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="border border-gray-300 text-gray-600 px-4 py-2.5 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
