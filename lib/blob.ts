import 'server-only'

import { randomUUID } from 'node:crypto'
import { del, put } from '@vercel/blob'
import { validateImageUpload, type UploadPurpose } from '@/lib/upload-validation'

async function uploadImage(file: File, purpose: UploadPurpose, access: 'private' | 'public') {
  const { bytes, contentType, extension } = await validateImageUpload(file, purpose)
  const pathname = `${purpose}/${randomUUID()}.${extension}`
  const blob = await put(pathname, Buffer.from(bytes), {
    access,
    contentType,
    addRandomSuffix: false,
    allowOverwrite: false,
  })
  return blob.url
}

export function uploadPaymentProof(file: File) {
  return uploadImage(file, 'payment-proofs', 'private')
}

export function uploadMaintenancePhoto(file: File) {
  return uploadImage(file, 'maintenance', 'private')
}

export function uploadPaymentQr(file: File) {
  return uploadImage(file, 'qr', 'public')
}

export async function deleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch {
    // Ignore errors on delete — blob may already be gone
  }
}
