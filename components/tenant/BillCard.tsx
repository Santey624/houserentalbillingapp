'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import InvoicePDF from '@/components/pdf/InvoicePDF'
import type { InvoiceData } from '@/lib/invoiceTypes'
import { downloadBlob, imageToDataUrl } from '@/lib/downloadBlob'
import { Download } from 'lucide-react'

interface Props {
  data: InvoiceData
  filename: string
}

export default function BillCard({ data, filename }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    try {
      setLoading(true)
      const [logoDataUrl, qrDataUrl] = await Promise.all([
        imageToDataUrl('/gharkatha-logo.png'),
        imageToDataUrl(data.landlord.qrImageUrl),
      ])
      const blob = await pdf(
        <InvoicePDF
          data={{
            ...data,
            landlord: { ...data.landlord, qrImageUrl: qrDataUrl },
            meta: { ...data.meta, logoDataUrl },
          }}
        />
      ).toBlob()
      downloadBlob(blob, `${filename}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      alert('Could not generate PDF. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-primary w-full h-12 disabled:opacity-60 flex items-center justify-center gap-2"
    >
      <Download size={18} />
      {loading ? 'Preparing PDF...' : 'Download Invoice PDF'}
    </button>
  )
}
