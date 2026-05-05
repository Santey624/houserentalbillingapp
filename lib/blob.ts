import { put, del } from '@vercel/blob'

export async function uploadBlob(file: File, folder: string): Promise<string> {
  const filename = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const blob = await put(filename, file, { access: 'public' })
  return blob.url
}

export async function deleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch {
    // Ignore errors on delete — blob may already be gone
  }
}
