/** Trigger a browser file download from a Blob (must append the link for Safari/Chrome). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Delay revoke so the browser can start the download
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Absolute origin for PDF assets loaded in the browser by @react-pdf/renderer. */
export function pdfAssetUrl(path: string): string {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (typeof window === 'undefined') return normalized
  return `${window.location.origin}${normalized}`
}
