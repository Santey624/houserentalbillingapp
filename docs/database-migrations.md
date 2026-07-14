# Database migration runbook

Use `prisma migrate deploy`; do not use `prisma db push` against shared or production databases.

## Existing database baseline

The `20260714000000_baseline` migration represents the schema that existed before tracked migrations were introduced. For an existing database:

1. Take and verify a provider backup/PITR checkpoint.
2. Confirm the database matches `prisma/migrations/20260714000000_baseline/migration.sql`.
3. Mark only that migration as already applied:
   `npx prisma migrate resolve --applied 20260714000000_baseline`
4. Run the duplicate preflight below.
5. Apply pending migrations with `npm run migrate:deploy`.

Never mark `20260714001000_security_hardening` as applied without executing it.

## Duplicate preflight

The hardening migration intentionally fails if current data violates a new invariant. Resolve conflicts through an audited product decision before deployment.

```sql
SELECT "unitId", COUNT(*) FROM "Tenancy"
WHERE "status" = 'ACTIVE' GROUP BY "unitId" HAVING COUNT(*) > 1;

SELECT "tenantId", "buildingId", COUNT(*) FROM "JoinRequest"
WHERE "status" = 'PENDING' GROUP BY "tenantId", "buildingId" HAVING COUNT(*) > 1;

SELECT "invoiceId", COUNT(*) FROM "Payment"
WHERE "status" = 'PENDING_VERIFICATION' GROUP BY "invoiceId" HAVING COUNT(*) > 1;
```

## Rollback policy

Schema rollbacks are not automated because dropping columns/indexes can destroy data. If deployment fails, stop application promotion, restore from the verified checkpoint when necessary, and ship a reviewed forward-fix migration. The nullable `MaintenanceRequest.tenancyId` supports a staged historical-data backfill before it is made mandatory.
