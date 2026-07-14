export function unitBelongsToBuilding(
  unit: { buildingId: string } | null | undefined,
  buildingId: string
) {
  return unit?.buildingId === buildingId
}

export function canAccessPaymentProof(
  userId: string,
  owners: { tenantUserId: string; landlordUserId: string }
) {
  return userId === owners.tenantUserId || userId === owners.landlordUserId
}

export function canAccessMaintenancePhoto(
  userId: string,
  owners: { tenantUserId: string; landlordUserIds: string[] }
) {
  return userId === owners.tenantUserId || owners.landlordUserIds.includes(userId)
}
