# GharKatha Production-Readiness Engineering Review

**Review date:** 2026-07-14
**Repository:** `/Users/santoshgairesharma/Documents/houserentapp/aks-invoice`
**Reviewed revision:** `main` at `099fe38` (working tree also contained this untracked report)
**Framework baseline:** Next.js 16.2.0, React 19.2.4, Prisma 7.8.0, PostgreSQL/Neon, Auth.js v5 beta
**Verdict:** **Do not approve for production**

## 1. Executive summary

GharKatha is a coherent, useful product prototype with a clean Next.js App Router structure, generally readable TypeScript, server-side authorization on most mutations, sensible use of React Server Components, transactional updates in several billing flows, loading states, responsive UI, and a production build that passes.

It is not production-ready. The principal blockers are not cosmetic:

1. Cross-tenant authorization defects permit resource reassignment and excessive tenant discovery.
2. Payment proof and maintenance uploads are accepted without server-side type/size/content controls and stored as public blobs.
3. `next@16.2.0` is covered by high-severity advisories; the production dependency audit reports 42 vulnerabilities.
4. There are no tracked database migrations, tests, CI policy, structured observability, health checks, runbooks, or rollback evidence.
5. Financial values use floating point, key workflows lack database invariants/idempotency, and unbounded queries/global scans will not scale.
6. Authentication has no application rate limiting, signup auto-verifies email, and password reset does not revoke existing JWT sessions.

The build passing proves compile-time compatibility; it does **not** prove runtime authentication, data isolation, upload safety, email delivery, database migrations, or resilience under traffic.

### Scorecard

| Area | Score / 10 | Assessment |
|---|---:|---|
| Architecture | 5.5 | Clear folders and roles; business/data access is tightly coupled to routes/actions |
| Code quality | 5.7 | Readable overall; duplicated invoice mapping, `any`, dead legacy form code, oversized functions |
| System design | 4.0 | Stateless web tier; weak invariants, idempotency, background delivery, and failure design |
| Backend | 4.2 | Good Zod/auth intent; serious tenant-boundary and upload defects |
| Frontend | 6.2 | Consistent UI and loading states; accessibility and client-bundle issues remain |
| Database | 3.8 | Relationships and basic indexes exist; no migrations, Decimal money, or active-state constraints |
| API design | 3.8 | Small surface and Web APIs; inconsistent errors, no pagination/versioning/schema contract |
| Performance | 4.5 | Parallel dashboard reads and RSC are positive; unbounded reads/global scans dominate |
| Security | 2.5 | Multiple OWASP access-control and upload blockers; vulnerable dependencies |
| Scalability | 3.3 | Suitable only for limited traffic after fixes; not evidenced for 100K+ users |
| Reliability | 2.8 | No durable outbox, SLOs, alerts, health endpoints, or recovery evidence |
| DevOps | 2.0 | Build script exists; no tracked CI/CD, IaC, migration gate, or rollback plan |
| Testing | 0.5 | No tracked unit, integration, E2E, security, or load tests |
| Maintainability | 5.0 | Navigable codebase; weak boundaries and absent tests increase change risk |
| Production readiness | 2.7 | Compilation succeeds, but security and operational blockers prevent approval |

**Weighted overall:** **4.0 / 10**
**Grade:** **D**

## 2. Scope, method, and evidence

### Method

- Established the source-controlled inventory with `git ls-files` and untracked state with `git status --short --untracked-files=all`.
- Inspected all 144 tracked project files. Text/source/config/docs were read; binary assets were inventoried by path, format/size metadata, and code usage rather than decoded line-by-line.
- Inspected `review.md`, the sole untracked project file at review start.
- Excluded dependency/vendor/generated/cache contents from line review: `node_modules/`, `.next/`, generated Prisma client, Git internals, and ignored local environment files.
- Inspected environment **key references only**: `DATABASE_URL`, `DIRECT_URL`, `NODE_ENV`, `RESEND_API_KEY`, `RESEND_FROM`, and `AUTH_URL`. Secret values were not recorded.
- Read mandatory workspace guidance in `AGENTS.md` and `CLAUDE.md`.
- Before evaluating Next.js APIs, read installed Next.js 16.2 documentation under `node_modules/next/dist/docs/`, including production checklist, authentication, data security, backend-for-frontend, `proxy`, and `after`.
- Applied the loaded Next.js, Vercel CLI, Functions, Storage, routing, React, and Canvas guidance. No deployment or external Vercel mutation was performed.

### Coverage manifest

```json
{
  "inventoryCommand": "git ls-files",
  "trackedFiles": 144,
  "untrackedProjectFilesReviewed": ["review.md"],
  "categories": {
    "app": 72,
    "components": 29,
    "lib": 12,
    "hooks": 1,
    "prisma": 1,
    "public": 18,
    "rootConfigDocs": 11
  },
  "textOrSourceFilesInspected": 129,
  "binaryAssetsMetadataInspected": 15,
  "trackedTests": 0,
  "trackedMigrations": 0,
  "trackedCIWorkflows": 0,
  "explicitExclusions": [
    "node_modules/** dependency contents except installed Next.js official docs",
    ".next/** generated build output",
    "generated Prisma client",
    ".git/** internals and sample hooks",
    "ignored local environment values",
    "binary payload decoding for PNG/WOFF/WOFF2"
  ]
}
```

**Reviewed source groups:** every tracked file under `app/**`, `components/**`, `hooks/**`, `lib/**`, `prisma/**`; root `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `next.config.ts`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `prisma.config.ts`, `proxy.ts`, and `tsconfig.json`.

**Binary/asset inventory:** `app/icon.png`, `app/opengraph-image.png`; five SVGs; three PNG brand assets; ten WOFF/WOFF2 files. The largest tracked asset is `public/gharkatha.png` at approximately 858 KB. Usage was checked through imports/URLs. Fonts are duplicated in WOFF and WOFF2 while the PDF code uses WOFF.

**Repository state:** `main` matched `origin/main`; only `review.md` was untracked before report generation. Verification created no source changes.

### What could not be verified

- Production/staging Vercel configuration, deployment protection, WAF, firewall, region, Fluid Compute, logs, alerts, backups, PITR, restore drills, domains, TLS, and rollback behavior.
- Actual Neon pooling limits, query plans, dataset cardinality, p50/p95/p99 latency, throughput, memory, CPU, bundle transfer size, Core Web Vitals, or cost.
- Auth cookie flags and provider behavior at runtime beyond static library configuration.
- Real email, Blob, database, and payment-proof flows; no credentials or external services were exercised.
- Accessibility conformance with assistive technology, browser E2E behavior, penetration testing, and load testing.
- License/source provenance for font and image assets.

## 3. Architecture and major-module ratings

| Module | Rating | Evidence-based assessment |
|---|---:|---|
| Auth (`lib/auth.ts`, auth actions/pages, `proxy.ts`) | 4/10 | Library-based auth and local guards; auto-verification, no throttling, stale JWT roles, reset-session gap, risky DB proxy |
| Landlord billing (`app/actions/invoices.ts`, invoice pages/form) | 5/10 | Rich workflow and ownership checks; 490-line action, race-prone numbering, partial transactions, Float money |
| Tenant/join lifecycle | 3/10 | Clear UX; cross-building unit integrity gap and race-prone occupancy |
| Payments/uploads | 2/10 | Ownership check exists; public unrestricted evidence, replay/duplicate submissions, weak amount invariant |
| Maintenance | 3/10 | Role checks and notifications; request is not tied to tenancy/building, causing historical ownership ambiguity |
| Notifications/email | 4/10 | Non-blocking `after()` is appropriate; no durable delivery/outbox, PII logging, or retry/dead-letter model |
| Data layer/Prisma | 4/10 | Typed ORM and basic indexes; no isolated DAL, migrations, Decimal amounts, or critical constraints |
| Route handlers/API | 3/10 | Conventional handlers; public over-fetching, global tenant enumeration, no pagination/rate limits/contracts |
| Frontend/UI | 6/10 | Consistent design, RSC-first, responsive/loading states; raw labels, destructive actions without confirmation, `<img>` and heavy PDF client code |
| PDF/invoice utilities | 6/10 | Focused document output; duplicated transformations and browser-relative asset assumptions |
| Marketing/SEO | 7/10 | Strong metadata, sitemap, robots, JSON-LD; legal links are nonfunctional labels and claims need policy backing |
| Delivery/operations | 2/10 | Reproducible npm lock and passing build; no CI, migration/release/rollback/observability artifacts |

### Strengths worth preserving

- Route groups clearly separate public, landlord, and tenant experiences.
- Most server actions authenticate and perform resource ownership checks close to mutations.
- Prisma relations use foreign keys/cascades and common foreign keys have indexes.
- Dashboard independent queries use `Promise.all`.
- Sensitive page reads usually filter through landlord or tenant ownership.
- Zod validates the main form payloads.
- Loading, error, not-found, metadata, robots, and sitemap conventions are present.
- `after()` removes notification/email latency from primary responses.
- TypeScript strict mode and a deterministic package lock are enabled.

## 4. Critical production blockers

### C-01 — Cross-tenant unit reassignment (OWASP A01)

**Evidence:** `updateUnitAction` verifies ownership of the current unit in `app/actions/units.ts:36-47`, then writes all parsed `UnitSchema` data, including `buildingId`, in `app/actions/units.ts:49-52`. It never verifies that the target building belongs to the caller.

**Impact:** A landlord who obtains another building ID can move their unit into another landlord’s building, corrupting tenancy isolation and potentially exposing downstream data.

**Remediation:** Do not permit `buildingId` in a general unit update DTO, or authorize both source and target buildings in one transaction. Add tenant-boundary integration tests.

### C-02 — Join requests accept a unit from another building

**Evidence:** `JoinRequestSchema` independently accepts `buildingId` and optional `unitId` (`lib/validations.ts:47-51`). `submitJoinRequestAction` persists both without checking the unit belongs to that building (`app/actions/join-requests.ts:18-33`). Approval checks the building owner but not unit/building consistency (`app/actions/join-requests.ts:60-91`).

**Impact:** Cross-landlord tenancy assignment and corrupted authorization graph.

**Remediation:** Validate `unit.buildingId === buildingId` at submission and approval; enforce the invariant transactionally.

### C-03 — `/api/tenants` exposes platform-wide tenants to any landlord

**Evidence:** `app/api/tenants/route.ts:77-96` runs `db.tenant.findMany()` with no landlord scope and returns each tenant’s email or unit information (`:98-125`).

**Impact:** Cross-tenant personal-data enumeration and an O(N) query/response path.

**Remediation:** Return only tenants connected to the authenticated landlord or explicitly invited identifiers; paginate; use minimal DTOs; return 401/403 without redirect semantics.

### C-04 — Public building search over-exposes tenancy records

**Evidence:** unauthenticated `GET /api/buildings/search` accepts empty queries and includes units with full active tenancy records (`app/api/buildings/search/route.ts:4-24`).

**Impact:** Public enumeration of building/unit IDs and active tenancy identifiers; the leaked IDs amplify C-01/C-02.

**Remediation:** Require a meaningful bounded query, rate-limit, select only public fields and vacancy counts, and never serialize tenancy records.

### C-05 — Payment and maintenance evidence is unrestricted and public

**Evidence:** `uploadBlob` stores every file with `{ access: 'public' }` (`lib/blob.ts:3-6`). Server actions only test `size > 0` (`app/actions/payments.ts:37-41`, `maintenance.ts:26-30`, `settings.ts:32-37`). Browser `accept="image/*"` is not security validation.

**Impact:** Sensitive payment screenshots become bearer-accessible public URLs; arbitrary-size/type uploads enable malware hosting, cost abuse, memory pressure, and stored-content risk.

**Remediation:** Use private Blob for sensitive evidence; enforce server-side byte limits, allowlisted MIME plus magic-byte validation, randomized filenames, quotas, malware scanning, retention/deletion, and authorized download handlers.

### C-06 — Vulnerable production dependency tree

**Evidence:** `npm audit --omit=dev` reports **42 vulnerabilities: 25 high, 16 moderate, 1 low**. `next@16.2.0` is affected by high-severity DoS, Proxy bypass/cache poisoning, XSS, SSRF, and cache issues; the audit identifies `16.2.10` as the patched target. `vercel` and `prisma` are runtime dependencies, pulling large toolchains into the production audit surface.

**Impact:** Known exploitable framework and transitive risks; Proxy is part of the authorization defense.

**Remediation:** Upgrade through version-matched migration guidance; move CLI/build-only packages to `devDependencies`; produce and enforce a reviewed zero-high vulnerability policy. Do not blindly run `npm audit fix --force`.

### C-07 — No database migration history or deployment gate

**Evidence:** only `prisma/schema.prisma` is tracked; `prisma/migrations/**` is absent. README directs a manual production `prisma db push`.

**Impact:** No auditable, repeatable, reviewable, rollback-aware schema evolution; high risk of drift or destructive production changes.

**Remediation:** Baseline migrations, use `prisma migrate deploy` in a controlled release stage, back up before risky changes, and document rollback/forward-fix strategy.

### C-08 — Financial records use binary floating point

**Evidence:** rent, rates, amounts, readings, and totals are Prisma `Float` (`prisma/schema.prisma:127,235-238,257-259,271-275,286`); calculations use JavaScript `number`.

**Impact:** Rounding drift, inconsistent totals, and audit/reconciliation errors.

**Remediation:** Store currency as integer minor units or `Decimal` with explicit rounding policy. Keep meter precision separate from money precision.

### C-09 — No test or CI safety net

**Evidence:** zero tracked test files; no test/lint/format scripts; no `.github/workflows`; no coverage configuration.

**Impact:** Authorization, billing, migration, and concurrency regressions can merge undetected.

**Remediation:** Block release until critical domain and security tests exist and CI enforces typecheck, lint, tests, migration validation, build, audit/SCA, and secret scanning.

### C-10 — No application-level rate limiting or abuse controls

**Evidence:** no rate-limit implementation across signup, signin, password reset, public search, uploads, or expensive server actions.

**Impact:** Credential stuffing, account creation abuse, email flooding, database amplification, upload cost attacks, and search enumeration.

**Remediation:** Distributed limits by IP/account/action with safe proxy-IP handling, escalating cooldowns, bot controls, quotas, and alerting.

### C-11 — Authentication lifecycle is not production-safe

**Evidence:** signup sets `emailVerified: new Date()` (`app/actions/auth.ts:31-38`) while verification code remains; signup reveals duplicate email; password reset changes the password but JWT sessions remain valid (`:131-152`); JWT embeds role without refresh (`lib/auth.ts:61-73`).

**Impact:** Email ownership is not verified; compromised sessions survive password reset; authorization can remain stale after role changes.

**Remediation:** Implement actual verification, neutral signup responses, session/token versioning and revocation on reset/security events, bounded JWT lifetime, and auth flow tests.

### C-12 — Core concurrency invariants are absent

**Evidence:** active tenancy has no uniqueness/exclusion constraint; join approval performs check-then-create (`app/actions/join-requests.ts:73-91`); invoice number allocation uses count-plus-retry (`app/actions/invoices.ts:53-84`); payment submissions can be repeated (`app/actions/payments.ts:14-57`).

**Impact:** double occupancy, duplicate operations, retry ambiguity, and contention at scale.

**Remediation:** Add database-enforced invariants, atomic state transitions, idempotency keys, and concurrency tests. Use a sequence/ULID or scoped counter for invoice numbers.

### C-13 — No operational readiness evidence

**Evidence:** no structured logger, tracing, exception service, metrics, health/readiness endpoint, SLO, alert definition, runbook, backup/restore procedure, release strategy, or rollback artifact.

**Impact:** failures cannot be detected, diagnosed, or recovered predictably.

**Remediation:** Define SLIs/SLOs, instrument request/action/database/external-service paths, add correlation IDs and redaction, health checks, dashboards/alerts, backup/PITR validation, incident runbooks, and rollback drills.

## 5. Medium-priority findings

### M-01 — Risky Prisma `Proxy` wrapper

`lib/db.ts:28-33` exports a JavaScript Proxy around `PrismaClient`, and `lib/auth.ts:32` passes it to `PrismaAdapter`. The loaded storage guidance explicitly warns that adapter introspection can break through such proxies. The build passes, but runtime auth behavior was not exercised. Export a normal initialized client or `getDb()` and run integration tests.

### M-02 — Partial transactions leave orphaned state

Signup creates `User` then profile in separate writes (`app/actions/auth.ts:31-49`). Direct billing creates user/tenant/tenancy before invoice creation (`app/actions/invoices.ts:233-304`). A later failure leaves partial records. Wrap each business operation in one transaction and make retries idempotent.

### M-03 — Maintenance ownership is modeled indirectly

`MaintenanceRequest` references only `tenantId` (`prisma/schema.prisma:299-313`). Landlord authorization is inferred from the tenant’s **current** active tenancies. Historical requests can disappear from a former landlord or become visible to a later landlord. Reference the originating tenancy/unit/building directly and preserve historical ownership.

### M-04 — Payment invariants are weak

The submitted amount is a hidden browser field and only validated as positive (`PaymentSchema`); duplicate pending payments are allowed; verification overwrites invoice status without an atomic expected-state condition. Derive amount server-side, enforce allowed tolerance/state, and make verification compare-and-set.

### M-05 — Unbounded list queries and missing composite indexes

Landlord invoices, tenant invoices, tenants, buildings, join requests, and maintenance pages load all matching rows. Common predicates combine owner/status/date but schema indexes are mostly single foreign keys. Add cursor pagination and query-plan-driven composite indexes such as ownership + status + createdAt. Exact indexes require production query plans.

### M-06 — Email delivery is best-effort, not durable

`after()` is correctly non-blocking, but notification creation and email have no outbox, retry budget, deduplication, dead-letter state, or delivery telemetry. Persist events transactionally and process through a durable queue/workflow.

### M-07 — PII is logged

`lib/email.ts:23-42` logs recipient email, subject, sender, provider errors, and message IDs. Password reset failures log the user email (`app/actions/auth.ts:119`). Use structured, redacted logs and correlation IDs.

### M-08 — Security headers and CSP are absent

No CSP, HSTS, frame-ancestors/X-Frame-Options, Referrer-Policy, Permissions-Policy, or explicit MIME hardening is configured in source. Add a tested header policy; validate with the deployed platform because some headers may be externally configured.

### M-09 — API contracts are inconsistent

`getLandlord()` redirects on missing auth, so API handlers’ intended 401 branches are effectively unreachable. Errors vary between thrown strings and JSON. There is no OpenAPI/schema contract, versioning, consistent problem response, or request ID. Establish a typed API error envelope and separate API auth from page redirects.

### M-10 — Oversized mixed-responsibility modules

`app/actions/invoices.ts` is 490 lines, `components/landlord/InvoiceForm.tsx` is 501 lines, and `app/(landlord)/landlord/invoices/new/page.tsx` is 442 lines. They mix authorization, orchestration, query policy, state transitions, mapping, and presentation. Split by domain service/use case and DTO.

### M-11 — Dead/duplicated invoice implementation

`hooks/useInvoiceForm.ts` and multiple `components/form/**` files represent a second form path with hard-coded personal defaults in `lib/constants.ts`. Invoice-to-PDF mapping is duplicated in tenant and landlord components. Remove unused legacy code after confirming references and centralize invoice DTO mapping.

### M-12 — Accessibility and destructive-action gaps

Many labels lack `htmlFor`/input IDs, icon-only buttons depend on `title`, the mobile drawer lacks dialog semantics/focus trap/Escape handling, and destructive delete/end/reject actions have no confirmation. Add semantic labels, accessible dialogs, focus management, and automated/manual a11y tests.

### M-13 — Client bundle includes heavy PDF rendering

`@react-pdf/renderer` is imported into client components (`BillCard`, `DownloadInvoiceButton`, `GenerateButton`). This likely increases client JS and memory, but exact bundle size was not measured. Prefer a protected server-generated PDF endpoint or lazy dynamic import and verify with a bundle analyzer.

### M-14 — Data minimization boundaries are inconsistent

Database access occurs directly in pages, actions, route handlers, server components, and notification components. Some selects are minimal; others include broad records. Establish a `server-only` DAL with authorization and DTO functions, matching installed Next.js 16 data-security guidance.

### M-15 — Delete/cascade and audit policy is unsafe for financial history

Building/unit/tenancy cascades can remove invoices and payments; invoice deletion is a hard delete. No immutable audit trail records who changed financial status or why. Use soft deletion/archival, immutable event/audit records, and retention policy.

### M-16 — Environment contract is missing from source control

README references `.env.example`, but `.gitignore` excludes all `.env*` and no template is tracked. Create a secret-free environment schema/template and validate keys at startup/build. Keep actual values out of Git.

## 6. Low-priority findings

1. Replace remaining `any` casts in landlord list/detail pages and `lib/auth.ts` with generated Prisma payload/JWT types.
2. Use `next/image` or an explicitly justified unoptimized strategy for remote QR display; configure allowed hosts if required.
3. Avoid `priority` on every logo instance; reserve it for above-the-fold LCP images.
4. Remove duplicate WOFF2 assets if only WOFF is required by the PDF renderer, or use WOFF2 where supported; verify license metadata.
5. Replace hard-coded site URL with a validated environment-derived canonical URL across preview/staging/production.
6. Add legal routes for Privacy, Terms, retention/deletion, and contact rather than non-interactive footer text.
7. Normalize formatting conventions (mixed semicolons/quotes) with a formatter/linter.
8. Replace the emoji notification icon in the unused `NotificationBell` and remove the component if dead.

## 7. Security/OWASP assessment

| OWASP area | Result |
|---|---|
| A01 Broken Access Control | **Fail** — C-01 through C-04; indirect maintenance ownership |
| A02 Cryptographic Failures | Partial — bcrypt cost 12 and Auth.js are positive; session revocation and secret lifecycle unverified |
| A03 Injection | ORM parameterization reduces SQL injection; email HTML is assembled from user-controlled strings without explicit escaping |
| A04 Insecure Design | **Fail** — missing idempotency/invariants, public evidence, no abuse model |
| A05 Security Misconfiguration | **Fail** — no source-controlled security headers/CSP or env contract |
| A06 Vulnerable Components | **Fail** — 25 high audit findings |
| A07 Identification/Auth Failures | **Fail** — auto-verification, no rate limits, reset does not revoke JWT |
| A08 Integrity Failures | **Fail** — no CI provenance/migration gate; weak financial state invariants |
| A09 Logging/Monitoring Failures | **Fail** — PII console logs, no structured monitoring/alerts |
| A10 SSRF | No direct application SSRF sink found; dependency advisory exists and dynamic Blob URLs need controlled handling |

No raw SQL, `eval`, or user-controlled `dangerouslySetInnerHTML` was found. JSON-LD uses static server-defined objects. That is positive but does not offset the access-control and upload failures.

## 8. Database and scale analysis

### Current database design

Positive: normalized user/profile/property/tenancy/invoice/payment entities, explicit relations, cascades, unique user email, unique unit number per building, and indexes on common foreign keys.

Deficits:

- No migration history or seed/test database strategy.
- Money as `Float`.
- No uniqueness for active tenancy per unit or tenant/unit active pair.
- No dedupe constraint for pending join requests or payment submissions.
- Status/time query patterns lack composite indexes.
- String dates and Nepali periods lack canonical validation/ordering semantics.
- Notification `type` and verification token `type` are unconstrained strings.
- No optimistic concurrency/version column.
- No audit/event ledger or soft deletion.

### 100K users

**Not ready today.** The web tier is mostly stateless and Vercel/Neon can scale, but `/api/tenants` performs a platform-wide scan, list pages are unbounded, public search is abuseable, and email/upload operations lack limits. With pagination, scoped queries, indexes, pooled connections, rate limiting, durable jobs, and measured SLOs, the current modular monolith is a reasonable architecture for this range.

### 1M users

**Not ready.** Require tenant-scoped data access, query-plan/index review, partition/retention strategy for notifications/audit, durable asynchronous delivery, read/cache strategy for public search, capacity tests, connection budget controls, and operational ownership. Microservices are not inherently required; strong modular boundaries and asynchronous workloads are.

### 10M users

**Not ready and cannot be projected from repository evidence.** Expect regional/data-residency decisions, partitioning/sharding or service-specific stores, event-driven billing/notifications, idempotent consumers, multi-region recovery, formal SLO/error budgets, abuse infrastructure, and continuous load/chaos testing. Architecture must follow measured bottlenecks, not an assumed user count.

## 9. Performance and reliability

### Likely bottlenecks from code

- Global/unbounded Prisma reads and nested includes.
- Count-based invoice allocation grows with annual invoice volume and contends concurrently.
- PDF rendering and font/image work occurs in the browser.
- Proxy authenticates every matched request; runtime cost must be measured.
- Public search `contains` across multiple columns has no demonstrated search index.
- Serial email/notification loops for landlords in `after()`.

### What is not supported by evidence

No claim is made about actual latency, memory, CPU, cache hit ratio, database saturation, bundle KB, or Core Web Vitals. No benchmark, trace, field data, or load test exists.

### Reliability design gaps

- No timeout/retry policy for Resend/Blob/DB at application level.
- No circuit breaker or bulkhead; these may be unnecessary initially but failure budgets must be explicit.
- No durable background queue/outbox.
- No idempotency keys for mutations.
- No health/readiness check or graceful degradation plan.
- No backup/restore drill evidence.

## 10. Verification outcomes

| Command | Outcome |
|---|---|
| `git status --short --untracked-files=all` | Passed; only `review.md` was untracked |
| `git ls-files` | 144 tracked files inventoried |
| `node --version` | `v25.2.1` |
| `npm --version` | `11.6.2` |
| `npm run` | Only `dev`, `build`, `start`; no lint/test/format/migration scripts |
| `npx tsc --noEmit` | **Passed**, exit 0 |
| `npm run build` | **Passed**, Prisma client generated; Next.js 16.2/Turbopack compiled, typed, and produced 34 static pages plus dynamic routes |
| `npm audit --omit=dev` | **Failed**, exit 1; 42 vulnerabilities (25 high, 16 moderate, 1 low) |

Both npm commands emitted `Unknown env config "devdir"`; this is environment/tooling noise, not an application compilation defect.

The build loaded seven local environment variables without printing their values. It did not validate external connectivity because build-time paths did not require live service calls.

## 11. Prioritized engineering plan

### Phase 0 — stop-ship security and integrity

1. Patch Next.js and dependency vulnerabilities; classify residual transitive exposure.
2. Fix C-01/C-02 authorization invariants and C-03/C-04 data exposure.
3. Make sensitive Blob objects private and implement upload controls.
4. Implement distributed rate limits for auth, search, uploads, and writes.
5. Add Decimal/minor-unit money and database concurrency constraints through migrations.
6. Correct email verification and session revocation.

### Phase 1 — release safety

1. Create migrations and production migration/rollback process.
2. Add CI with typecheck, lint, unit/integration/E2E, build, SCA, secret scan, and migration validation.
3. Add test fixtures and isolated ephemeral database.
4. Implement structured redacted telemetry, health checks, SLOs, alerts, and runbooks.
5. Add backup/PITR and restore validation.

### Phase 2 — maintainability and scale

1. Introduce a server-only DAL with tenant-scoped DTOs.
2. Split invoice/join/payment workflows into use-case services with atomic state transitions.
3. Add pagination and query-plan-driven indexes.
4. Introduce durable outbox/workflow for email and notifications.
5. Move/lazy-load PDF generation and measure bundles/Core Web Vitals.

## 12. Concrete refactor examples

### Tenant-scoped unit update

Create separate DTOs for mutable unit fields and movement. `updateUnitAction` should not accept an arbitrary `buildingId`. If movement is required, query the target building with `{ id: targetId, landlordId }` and update inside one transaction.

### DAL shape

Add `data/units.ts`, `data/invoices.ts`, and `data/tenants.ts` with `import 'server-only'`. Each exported operation should:

1. Resolve the authenticated principal.
2. Apply landlord/tenant ownership in the database predicate.
3. Select a minimal DTO.
4. Perform mutations with expected state and transaction boundaries.

Server actions then become thin transport adapters for validation, DAL invocation, and cache invalidation.

### Atomic invoice identity

Replace `count()` allocation with a database sequence, ULID, or scoped counter row updated atomically. Add a client-generated idempotency key unique per landlord/action so retries return the original invoice.

### Private upload boundary

Replace the generic `uploadBlob(file, folder)` with purpose-specific functions (`uploadPaymentProof`, `uploadMaintenancePhoto`, `uploadPaymentQr`) that enforce byte limit, MIME and signature, private/public access policy, retention, and ownership metadata.

## 13. Engineering-standard comparison

Compared with generally observable practices in mature engineering organizations—not unsupported claims about any company’s internal process—the repository meets a prototype bar in code readability, framework conventions, typed ORM usage, and feature completeness.

It falls below a production bar in:

- zero-trust tenant isolation;
- automated test and release gates;
- reviewed schema migrations;
- vulnerability management and dependency classification;
- financial-domain invariants;
- observability/SLO/incident readiness;
- privacy, retention, and upload governance;
- evidence-based capacity and recovery testing.

A Staff/Principal-level implementation would make invariants executable in schema/code/tests, design failure and retry behavior before launch, create measurable SLOs and capacity budgets, minimize tenant data by construction, and provide a safe release/rollback/incident operating model.

## 14. Explicit final verdicts

**Would I merge this code into `main`?**
Not as a production release. I would only merge behind a non-production flag/branch after fixing the cross-tenant defects and adding tests for them.

**Would I approve it in a production code review?**
No.

**Would this pass a Microsoft-style production readiness review?**
No. The access-control, vulnerable dependency, migration, testing, and operational-readiness gaps are stop-ship findings.

**Would this application survive production traffic?**
It may serve light traffic, but survival under meaningful load is unverified and several query/abuse paths are predictably unsafe. No reliable 100K/1M/10M claim can be made.

**Would I hire the engineer based solely on this project?**
No responsible hiring decision should be based solely on one repository. The project shows solid product delivery and modern framework fluency, but it does not yet demonstrate production security, reliability, testing, or scale ownership expected at senior/staff level.

**What most distinguishes this from Staff/Principal engineering?**
The missing layer is operational and systemic rigor: enforceable tenant/data invariants, threat modeling, migration/release safety, failure-mode design, durable asynchronous processing, measurable SLO/capacity evidence, and automated regression protection.

**Final approval:** **REJECT FOR PRODUCTION; suitable as a promising prototype after immediate security containment.**

## 15. Remediation progress — 2026-07-14

This section records implementation completed after the original review. The original findings above remain unchanged.

### Fixed in this pass

- **C-01/C-02 tenant isolation:** unit moves now authorize the target building; join submission and approval verify unit/building consistency; approval uses an expected-state transaction and a database-enforced one-active-tenancy-per-unit invariant.
- **C-03/C-04 data exposure:** tenant and unit APIs use API-safe authentication/role responses, bounded landlord-scoped queries, and minimal DTOs. Building search now requires a tenant session and a 2–80 character query, is rate-limited, and returns vacancy booleans rather than tenancy records.
- **C-05 new upload safety:** payment proofs and maintenance photos now use private Blob storage, randomized server filenames, MIME allowlists, magic-byte checks, byte limits, ownership-checked streaming routes, and orphan cleanup on failed writes. QR images receive the same validation with a smaller limit.
- **C-06 high-severity production dependencies:** Next.js was upgraded from 16.2.0 to 16.2.10; Prisma and Vercel CLIs moved to development dependencies; the Blob `undici` tree is pinned to patched 6.27.0. `npm audit --omit=dev --audit-level=high` exits 0 with no high vulnerabilities.
- **C-07/C-12 database safety:** tracked baseline and hardening migrations now exist, with partial unique indexes for active unit occupancy, pending join requests, and pending payments plus composite query indexes. `docs/database-migrations.md` documents baseline, duplicate preflight, backup, deployment, and forward-fix policy.
- **C-09 release safety:** Vitest security-boundary tests, strict typecheck/lint/test/migration scripts, and a GitHub Actions gate with ephemeral PostgreSQL migration deployment were added.
- **C-11 auth lifecycle:** public signup no longer auto-verifies email, account/profile/token creation is transactional, duplicate signup responses are neutral, sign-in requires verified email, verification/reset tokens are consumed atomically, JWT lifetime is bounded, roles refresh from the database, and password reset increments a session version and removes database sessions.
- **M-01/M-04/M-07/M-08/M-09/M-16:** removed the Prisma JavaScript proxy; payment amount is server-derived with compare-and-set transitions; logs no longer include recipient email and dynamic email HTML is escaped; security headers/CSP and secret-free `.env.example` were added; API handlers no longer rely on redirecting page helpers.
- **Operational baseline:** database-backed rate limits protect signup, sign-in, reset, search, and uploads; `/api/health` checks database readiness; uploads and major APIs use bounded responses.

### Partially fixed

- **C-05:** existing historical public Blob URLs still require an inventory and provider-side migration/deletion. Malware scanning, retention automation, and per-tenant storage quotas require an external scanner/storage policy.
- **C-10:** the database-backed limiter is distributed across app instances, but it covers the highest-risk flows rather than every mutation. Production proxy/header trust and platform WAF/bot controls still need deployment validation.
- **C-12:** occupancy, pending request/payment, and expected-state transitions are enforced. Invoice number allocation and general mutation idempotency keys remain.
- **C-13:** health checking, redacted logging, CI, and security headers now exist. Structured telemetry, tracing, alerts, SLOs, runbooks, and restore drills remain external/operational work.
- **M-03/M-05:** new maintenance records preserve originating tenancy ownership and APIs are bounded. Historical maintenance rows need an audited backfill, and page-level cursor pagination/query-plan validation remains.
- **M-08:** a deployable CSP is present, but it retains `unsafe-inline` for current Next.js styling/script compatibility; nonce-based CSP tightening needs browser/deployment testing.

### Still blocked or deferred

- **C-08:** converting financial `Float` columns to Decimal/minor units requires a product-approved rounding policy, data profiling, reconciliation, and a staged production backfill; it was not guessed or run against live data.
- Durable email/outbox delivery, immutable financial audit history, soft-delete/retention policy, full E2E/load/accessibility testing, provider backup/PITR verification, malware scanning, and production observability require product decisions or external infrastructure.
- The migrations were schema-validated locally and are exercised against ephemeral PostgreSQL in CI, but were not applied to the configured real database. Local Docker was unavailable, so no local disposable-Postgres migration execution was performed.

### Verification evidence

- `npm run prisma:validate` — passed.
- `npm run typecheck` — passed with strict TypeScript.
- `npm run lint` — passed with 24 pre-existing warnings and no errors.
- `npm test` — passed, 6/6 tests.
- `npm run build` — passed on Next.js 16.2.10; 34 static pages plus dynamic routes generated.
- `npm run audit:prod` — passed the high-severity gate; 5 moderate advisories remain in Prisma CLI peer tooling and Next.js-bundled PostCSS. Forced downgrades were not applied.