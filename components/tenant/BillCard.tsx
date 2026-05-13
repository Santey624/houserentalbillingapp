'use client'

import dynamic from 'next/dynamic'
import type { InvoiceData } from '@/lib/invoiceTypes'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
)
const InvoicePDF = dynamic(
  () => import('@/components/pdf/InvoicePDF'),
  { ssr: false }
)

interface Props {
  data: InvoiceData
  filename: string
}

export default function BillCard({ data, filename }: Props) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} />}
      fileName={`${filename}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          disabled={loading}
          className="btn-primary w-full h-12 disabled:opacity-60"
        >
          {loading ? 'Preparing PDF...' : 'Download Invoice PDF'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
