# AKS Rental Platform — Specification

A multi-tenant SaaS for landlords in Nepal to manage buildings, tenants, and rental invoices, with a tenant-facing portal for viewing bills, submitting payment proof, and filing maintenance requests.

This document captures **what we're building, why, and in what order**. It is the source of truth before any code is written.

---

## 1. Vision & Scope

### What this is
A web application where:
- **Landlords** sign up, create their building(s), add units, and invite/accept tenants. They generate monthly rental invoices (rent + electricity + extras), receive payment confirmation, and handle maintenance requests.
- **Tenants** sign up, find their building and request to join. Once approved, they view their bills, download invoice PDFs, upload payment proof, see payment history, and submit maintenance requests.

### What this is *not* (for v1)
- Not a payment processor — payments happen out-of-app (eSewa / Khalti / bank transfer / cash). The app records and verifies them.
- No SMS or push notifications — email + in-app only.
- No automated late fees — the landlord acts manually.
- No mobile app — web only, mobile-responsive.

### Localization
- **Currency:** NPR (Rs.)
- **Calendar:** Nepali calendar (Baisakh → Chaitra) for billing periods.
- **Language:** English UI for v1. Bilingual (English + Nepali) deferred to later.

---

## 2. User Roles

| Role | Description |
|---|---|
| **Landlord** | Creates and manages buildings, units, tenants, invoices. Approves tenant join requests. Verifies payments. Resolves maintenance requests. |
| **Tenant** | Self-signs up, requests to join a building, views their own bills, submits payment proof, files maintenance requests. |
| **Admin** | (Future, not v1) Platform-level admin for support. |

A user account is either a landlord or a tenant — chosen at signup. (One account = one role for v1; a person who is both can have two accounts.)

---

## 3. Core Entities (Data Model)

High-level model. Exact Prisma schema gets written at implementation time.

- **User** — base auth record (email, hashed password, emailVerified, role).
- **Landlord** — profile attached to a User with role=LANDLORD. Holds default invoice settings (electricity rate, payment due day, bank details, QR image URL).
- **Building** — owned by a Landlord. Has name, address, contact info. A landlord can own multiple buildings.
- **Unit** — belongs to a Building. Identified by unit number/name (e.g., "Flat 2B").
- **Tenant** — profile attached to a User with role=TENANT. Holds personal info.
- **Tenancy** — links a Tenant to a Unit. Has `startDate`, `endDate` (null = active), `status` (PENDING / ACTIVE / ENDED). Historical tenancies are preserved for record-keeping.
- **JoinRequest** — a Tenant's request to join a specific Building/Unit. Status: PENDING / APPROVED / REJECTED.
- **Invoice** — issued by Landlord for a Tenancy. Covers a Nepali month (or range), contains rent, service charge, electricity readings (per meter), additional line items, total, due date, status (UNPAID / PAYMENT_SUBMITTED / PAID / OVERDUE).
- **InvoiceLineItem** — child rows of Invoice (rent, per-meter electricity, custom extras).
- **MeterReading** — embedded in invoice line items (previous reading, current reading, units, rate, cost).
- **Payment** — submitted by Tenant against an Invoice. Has method (eSewa/Khalti/bank/cash), reference number, proof image URL, status (PENDING_VERIFICATION / VERIFIED / REJECTED), verifiedBy, verifiedAt.
- **MaintenanceRequest** — submitted by Tenant. Has title, description, photo URL, status (OPEN / IN_PROGRESS / RESOLVED / CLOSED), createdAt, resolvedAt, optional landlord note.
- **Notification** — in-app notifications (recipient, type, message, read/unread, createdAt).

---

## 4. Key User Flows

### 4.1 Landlord onboarding
1. Sign up with email + password.
2. Verify email (Resend).
3. Onboarding wizard: enter landlord profile, create first building, add unit(s), set default electricity rate and payment due day, optionally upload QR image and bank details.
4. Land on landlord dashboard.

### 4.2 Tenant onboarding
1. Sign up with email + password, choose role = Tenant.
2. Verify email.
3. **Search/browse buildings** — tenant searches by building name or landlord name.
4. Select building → select unit (if shown) → submit a join request with a short note (e.g., their full name and intended move-in date).
5. Wait for landlord approval. Tenant sees "pending" state in their dashboard.
6. Landlord approves → tenant is linked to the unit (Tenancy created with status=ACTIVE) → tenant gets email + in-app notification → tenant dashboard now shows bills section.

### 4.3 Invoice generation (Landlord)
1. Landlord opens a tenancy → "Generate Invoice."
2. Form pre-fills: tenant info, default rate, suggested Nepali month.
3. Landlord enters: rent, service charge, meter readings (previous + current per meter), additional line items.
4. System computes electricity cost per meter and grand total.
5. Landlord clicks "Generate" → invoice is saved to DB → PDF is rendered (existing `@react-pdf/renderer` flow, now server-side or on-demand) → tenant receives email + in-app notification.
6. Invoice status starts as UNPAID.

### 4.4 Payment & verification
1. Tenant opens an invoice → sees landlord's bank details and QR.
2. Tenant pays out-of-app (eSewa / bank / cash).
3. Tenant clicks "I've paid" → uploads screenshot/proof, enters reference number and payment method.
4. Invoice status → PAYMENT_SUBMITTED.
5. Landlord sees pending payment in dashboard → reviews proof → marks **Verified (Paid)** or **Rejected (Unpaid)**.
6. Tenant receives email + in-app notification with the result.
7. If rejected, tenant can resubmit.

### 4.5 Overdue handling
- Bills past their due date with status UNPAID or PAYMENT_SUBMITTED are flagged OVERDUE in the UI (visual flag only; no auto-fees).
- Landlord can manually add a late fee as a line item on a follow-up invoice.

### 4.6 Maintenance request
1. Tenant submits request (title + description + optional photo).
2. Landlord sees it in dashboard, can change status (OPEN → IN_PROGRESS → RESOLVED) and add a note.
3. Tenant gets in-app notification on each status change.

### 4.7 Tenant move-out
1. Landlord ends a tenancy → sets `endDate`, status → ENDED.
2. Tenant retains read-only access to their historical bills and tenancy record.
3. Unit becomes available for a new tenancy.

---

## 5. Notifications

**Channels:** Email (Resend) + in-app (notification bell with unread count).

**Triggers:**
- Email verification at signup
- Password reset
- Tenant join request submitted (landlord notified)
- Join request approved/rejected (tenant notified)
- New invoice issued (tenant notified)
- Payment proof submitted (landlord notified)
- Payment verified or rejected (tenant notified)
- Maintenance request submitted (landlord notified)
- Maintenance status changed (tenant notified)
- Tenancy ended (tenant notified)

---

## 6. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| PDF generation | `@react-pdf/renderer` (existing) |
| Backend | Next.js API routes / Server Actions |
| ORM | Prisma |
| Database | Neon (Postgres, serverless) |
| Auth | Auth.js (NextAuth v5) — email/password with verification |
| File storage | Vercel Blob (QR images, payment proofs, maintenance photos) |
| Email | Resend |
| Hosting | Vercel (free tier) |

---

## 7. Page / Route Map (high level)

### Public
- `/` — Landing page, sign-in/sign-up CTA
- `/auth/signin`, `/auth/signup`, `/auth/verify`, `/auth/reset`

### Landlord (`/landlord/...`)
- `/landlord` — dashboard (overview: pending payments, open requests, recent invoices)
- `/landlord/buildings` — list, create, edit
- `/landlord/buildings/[id]` — building detail with units
- `/landlord/units/[id]` — unit detail with current/past tenancies
- `/landlord/tenants` — all tenants across buildings
- `/landlord/join-requests` — incoming join requests, approve/reject
- `/landlord/invoices` — all invoices, filter by tenant/building/status
- `/landlord/invoices/new` — generate invoice
- `/landlord/invoices/[id]` — invoice detail + verify payment
- `/landlord/maintenance` — all maintenance requests
- `/landlord/settings` — profile, bank details, QR upload, defaults

### Tenant (`/tenant/...`)
- `/tenant` — dashboard (current bill, status, recent activity)
- `/tenant/buildings` — search and request to join
- `/tenant/invoices` — list of own invoices
- `/tenant/invoices/[id]` — invoice detail, download PDF, submit payment proof
- `/tenant/maintenance` — list and create maintenance requests
- `/tenant/settings` — profile

### Shared
- `/notifications` — full list

---

## 8. Phased Build Plan

We build in vertical slices — each phase ends with something testable end-to-end.

### Phase 0 — Foundation
- Set up Neon DB, Prisma, Auth.js, Resend, Vercel Blob credentials.
- Initial Prisma schema (User, Landlord, Tenant, Building, Unit).
- Auth flow: signup, email verify, signin, password reset, role selection.
- Layout shells for `/landlord` and `/tenant` with role-based redirects.

### Phase 1 — Landlord can manage buildings & units
- Landlord onboarding wizard.
- CRUD for buildings and units.
- Settings page (profile, bank details, QR upload via Vercel Blob).

### Phase 2 — Tenant join flow
- Tenant building search.
- Join request submit/list/approve/reject.
- Tenancy creation on approval.
- Email + in-app notifications wired up.

### Phase 3 — Invoices (the core)
- Migrate existing invoice form into the landlord app, bound to a tenancy.
- Persist invoices to DB.
- Render PDF on demand (download from invoice detail page).
- Tenant view of own invoices.

### Phase 4 — Payment workflow
- Tenant payment proof upload.
- Landlord verification UI.
- Status transitions and notifications.
- Overdue flag in UI.

### Phase 5 — Maintenance requests
- Tenant submit form with photo upload.
- Landlord queue and status management.
- Notifications on status changes.

### Phase 6 — Polish
- Notification bell with unread count.
- Move-out flow.
- Empty states, error handling, mobile responsiveness pass.
- Basic analytics for landlord (total collected this month, outstanding balance).

---

## 9. Open Questions / Decisions Deferred

- **Multiple meters per unit** — current app supports multiple meters; we'll keep that, but should meters be defined on the **Unit** (so they persist) or entered fresh each invoice (current behavior)? *Recommendation: define on Unit so previous reading auto-fills.*
- **Invoice numbering** — sequential per landlord, or per building? *Recommendation: per landlord, format `INV-YYYY-####`.*
- **Bilingual UI** — English only for v1, Nepali later.
- **Search visibility** — should *all* buildings be publicly searchable by tenants, or only ones the landlord marks "open to new tenants"? *Recommendation: a flag on Building, default open.*

These get resolved at the start of the relevant phase, not now.

---

## 10. Out of Scope for v1

- Payment gateway integration (eSewa / Khalti API)
- SMS notifications
- Mobile app
- Multi-language UI
- Auto late fees
- Lease document storage / e-signing
- Multi-landlord buildings (co-ownership)
- Tenant-to-tenant messaging