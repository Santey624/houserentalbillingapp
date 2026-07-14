const IMAGE_TYPES = {
  'image/png': { extension: 'png', signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  'image/jpeg': { extension: 'jpg', signature: [0xff, 0xd8, 0xff] },
  'image/gif': { extension: 'gif', signature: [0x47, 0x49, 0x46, 0x38] },
  'image/webp': { extension: 'webp', signature: [0x52, 0x49, 0x46, 0x46] },
} as const

type AllowedImageType = keyof typeof IMAGE_TYPES
export type UploadPurpose = 'payment-proofs' | 'maintenance' | 'qr'

const LIMITS: Record<UploadPurpose, number> = {
  'payment-proofs': 5 * 1024 * 1024,
  maintenance: 5 * 1024 * 1024,
  qr: 2 * 1024 * 1024,
}

export class UploadValidationError extends Error {}

function hasSignature(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((byte, index) => bytes[index] === byte)
}

export async function validateImageUpload(
  file: File,
  purpose: UploadPurpose
): Promise<{ bytes: Uint8Array; contentType: AllowedImageType; extension: string }> {
  if (file.size <= 0) throw new UploadValidationError('The selected file is empty.')
  if (file.size > LIMITS[purpose]) {
    throw new UploadValidationError(`The image must be smaller than ${LIMITS[purpose] / 1024 / 1024} MB.`)
  }

  const contentType = file.type.toLowerCase() as AllowedImageType
  const expected = IMAGE_TYPES[contentType]
  if (!expected) {
    throw new UploadValidationError('Only PNG, JPEG, GIF, and WebP images are allowed.')
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const validSignature =
    hasSignature(bytes, expected.signature) &&
    (contentType !== 'image/webp' ||
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP')
  if (!validSignature) {
    throw new UploadValidationError('The file contents do not match the declared image type.')
  }

  return { bytes, contentType, extension: expected.extension }
}
