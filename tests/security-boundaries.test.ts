import { describe, expect, it } from 'vitest'
import {
  canAccessMaintenancePhoto,
  canAccessPaymentProof,
  unitBelongsToBuilding,
} from '../lib/authorization'
import {
  UploadValidationError,
  validateImageUpload,
} from '../lib/upload-validation'

describe('tenant authorization boundaries', () => {
  it('rejects units from a different building', () => {
    expect(unitBelongsToBuilding({ buildingId: 'building-a' }, 'building-b')).toBe(false)
    expect(unitBelongsToBuilding({ buildingId: 'building-a' }, 'building-a')).toBe(true)
  })

  it('limits payment proof access to its tenant and landlord', () => {
    const owners = { tenantUserId: 'tenant-a', landlordUserId: 'landlord-a' }
    expect(canAccessPaymentProof('tenant-a', owners)).toBe(true)
    expect(canAccessPaymentProof('landlord-a', owners)).toBe(true)
    expect(canAccessPaymentProof('landlord-b', owners)).toBe(false)
  })

  it('limits maintenance photos to the originating tenancy', () => {
    const owners = { tenantUserId: 'tenant-a', landlordUserIds: ['landlord-a'] }
    expect(canAccessMaintenancePhoto('tenant-a', owners)).toBe(true)
    expect(canAccessMaintenancePhoto('landlord-a', owners)).toBe(true)
    expect(canAccessMaintenancePhoto('landlord-b', owners)).toBe(false)
  })
})

describe('upload validation', () => {
  it('accepts a PNG only when MIME and magic bytes agree', async () => {
    const png = new File(
      [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'proof.png',
      { type: 'image/png' }
    )
    await expect(validateImageUpload(png, 'payment-proofs')).resolves.toMatchObject({
      contentType: 'image/png',
      extension: 'png',
    })
  })

  it('rejects spoofed image content', async () => {
    const spoofed = new File(['not an image'], 'proof.png', { type: 'image/png' })
    await expect(validateImageUpload(spoofed, 'payment-proofs')).rejects.toBeInstanceOf(
      UploadValidationError
    )
  })

  it('rejects oversized QR images', async () => {
    const oversized = new File(
      [new Uint8Array(2 * 1024 * 1024 + 1)],
      'qr.png',
      { type: 'image/png' }
    )
    await expect(validateImageUpload(oversized, 'qr')).rejects.toThrow('smaller than 2 MB')
  })
})
