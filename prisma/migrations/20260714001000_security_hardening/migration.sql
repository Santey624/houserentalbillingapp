-- Security and query hardening. Run the documented duplicate preflight before deploy.
ALTER TABLE "User"
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "MaintenanceRequest"
ADD COLUMN "tenancyId" TEXT;

CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "MaintenanceRequest"
ADD CONSTRAINT "MaintenanceRequest_tenancyId_fkey"
FOREIGN KEY ("tenancyId") REFERENCES "Tenancy"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Building_landlordId_isOpen_createdAt_idx"
ON "Building"("landlordId", "isOpen", "createdAt");
CREATE INDEX "Tenancy_tenantId_status_createdAt_idx"
ON "Tenancy"("tenantId", "status", "createdAt");
CREATE INDEX "Tenancy_unitId_status_createdAt_idx"
ON "Tenancy"("unitId", "status", "createdAt");
CREATE INDEX "JoinRequest_buildingId_status_createdAt_idx"
ON "JoinRequest"("buildingId", "status", "createdAt");
CREATE INDEX "JoinRequest_tenantId_status_createdAt_idx"
ON "JoinRequest"("tenantId", "status", "createdAt");
CREATE INDEX "Invoice_tenancyId_status_createdAt_idx"
ON "Invoice"("tenancyId", "status", "createdAt");
CREATE INDEX "Payment_invoiceId_status_createdAt_idx"
ON "Payment"("invoiceId", "status", "createdAt");
CREATE INDEX "MaintenanceRequest_tenancyId_idx"
ON "MaintenanceRequest"("tenancyId");
CREATE INDEX "MaintenanceRequest_tenancyId_status_createdAt_idx"
ON "MaintenanceRequest"("tenancyId", "status", "createdAt");
CREATE INDEX "Notification_userId_isRead_createdAt_idx"
ON "Notification"("userId", "isRead", "createdAt");
CREATE INDEX "RateLimitBucket_updatedAt_idx"
ON "RateLimitBucket"("updatedAt");

-- PostgreSQL partial unique indexes enforce state-dependent concurrency invariants
-- that Prisma schema syntax cannot currently express.
CREATE UNIQUE INDEX "Tenancy_one_active_per_unit"
ON "Tenancy"("unitId") WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX "JoinRequest_one_pending_per_tenant_building"
ON "JoinRequest"("tenantId", "buildingId") WHERE "status" = 'PENDING';
CREATE UNIQUE INDEX "Payment_one_pending_per_invoice"
ON "Payment"("invoiceId") WHERE "status" = 'PENDING_VERIFICATION';
