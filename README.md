# AKS Rental Platform

A multi-tenant rental management platform for Nepal landlords and tenants. Landlords manage buildings, generate invoices in the Nepali calendar, and verify payments. Tenants view bills, download PDFs, submit payment proof, and file maintenance requests.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | Neon (Postgres, serverless) |
| Auth | Auth.js v5 (NextAuth beta) — email/password |
| File storage | Vercel Blob |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Hosting | Vercel |

---

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- A [Resend](https://resend.com) account and API key
- A [Vercel Blob](https://vercel.com/storage/blob) store (for file uploads)

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in each value:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
# Neon Postgres
# DATABASE_URL  — the pooled connection string (used by the app at runtime)
# DIRECT_URL    — the direct (non-pooled) connection string (used by Prisma Migrate)
# Both are shown on your Neon project dashboard under "Connection Details"
DATABASE_URL=postgres://user:password@ep-xxx.pooler.neon.tech/neondb?sslmode=require
DIRECT_URL=postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000

# Resend — get from https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=noreply@yourdomain.com

# Vercel Blob — get from https://vercel.com/storage/blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

**Getting `AUTH_SECRET`:**
```bash
openssl rand -base64 32
```

**Getting Neon connection strings:**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Open your project → Connection Details
3. Copy "Connection string" → that is your `DIRECT_URL`
4. Switch to "Pooled connection" → that is your `DATABASE_URL`

### 3. Push the database schema

```bash
npx prisma db push
```

This creates all tables in your Neon database. You should see confirmation for each model.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## First-time walkthrough

### As a Landlord

1. Go to `/auth/signup`, choose **Landlord**, fill in your details.
2. Check your email for the verification link and click it.
3. Sign in at `/auth/signin`.
4. You'll be redirected to the **Onboarding Wizard** (3 steps):
   - **Step 1 — Profile:** Enter your name, address, contact, electricity rate, payment due day.
   - **Step 2 — Building:** Create your first building (name, address).
   - **Step 3 — Unit:** Add your first unit (e.g., "Flat 2B").
5. Land on the **Landlord Dashboard** at `/landlord`.

### As a Tenant

1. Go to `/auth/signup`, choose **Tenant**, fill in your details.
2. Verify your email.
3. Sign in and go to `/tenant/buildings`.
4. Search for a building by name or landlord.
5. Click **Request to Join**, optionally select a unit and add a note.
6. Wait for landlord approval — you'll get an email and in-app notification.
7. Once approved, your **Tenant Dashboard** at `/tenant` shows your unit and invoices.

### Invoice flow

1. **Landlord** goes to `/landlord/invoices/new` (or click **Generate Invoice** on a unit).
2. Select the tenant, fill in rent, service charge, electricity meter readings, and any extras.
3. Click **Generate Invoice** — invoice is saved, tenant gets notified.
4. **Tenant** views the invoice at `/tenant/invoices/[id]`, downloads the PDF, pays out-of-app.
5. **Tenant** clicks **I've Paid**, uploads a screenshot, selects payment method, submits.
6. **Landlord** sees the pending payment at `/landlord/invoices/[id]`, clicks **Verify** or **Reject**.
7. Tenant is notified of the result.

---

## Route Reference

### Public
| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth/signup` | Sign up (role selection: Landlord / Tenant) |
| `/auth/signin` | Sign in |
| `/auth/verify?token=...` | Email verification |
| `/auth/reset` | Request password reset |
| `/auth/reset/[token]` | Set new password |

### Landlord (`/landlord/*`)
| Route | Description |
|---|---|
| `/landlord` | Dashboard — stats, alerts, recent invoices |
| `/landlord/onboarding` | First-time setup wizard |
| `/landlord/buildings` | List all buildings |
| `/landlord/buildings/new` | Create a building |
| `/landlord/buildings/[id]` | Building detail + units |
| `/landlord/units/[id]` | Unit detail + tenancy + invoices |
| `/landlord/tenants` | All active tenants |
| `/landlord/join-requests` | Approve / reject join requests |
| `/landlord/invoices` | All invoices with status filter |
| `/landlord/invoices/new` | Generate invoice |
| `/landlord/invoices/[id]` | Invoice detail + payment verification |
| `/landlord/maintenance` | Maintenance request queue |
| `/landlord/settings` | Profile, electricity rate, bank details, QR |

### Tenant (`/tenant/*`)
| Route | Description |
|---|---|
| `/tenant` | Dashboard — current unit, latest invoice |
| `/tenant/buildings` | Search buildings + submit join request |
| `/tenant/invoices` | All invoices |
| `/tenant/invoices/[id]` | Invoice detail + PDF download + payment proof |
| `/tenant/maintenance` | Submit and track maintenance requests |
| `/tenant/settings` | Profile settings |

### Shared
| Route | Description |
|---|---|
| `/notifications` | In-app notification list |
| `/api/buildings/search` | JSON API: building search (used by tenant page) |

---

## Project Structure

```
aks-invoice/
├── prisma/
│   └── schema.prisma          # All models and enums
├── prisma.config.ts            # Prisma 7 datasource config (for migrations)
├── proxy.ts                    # Next.js 16 route guard (replaces middleware.ts)
├── .env.example                # Environment variable template
├── lib/
│   ├── auth.ts                 # NextAuth v5 config + requireAuth / requireRole helpers
│   ├── db.ts                   # Lazy PrismaClient singleton (Prisma 7 + pg adapter)
│   ├── email.ts                # Resend email helpers
│   ├── blob.ts                 # Vercel Blob upload/delete
│   ├── validations.ts          # Zod schemas
│   ├── utils.ts                # cn(), formatRs(), generateToken(), generateInvoiceNumber()
│   ├── calculations.ts         # computeMeters(), filterCosts(), computeGrandTotal() (original)
│   ├── constants.ts            # NEPALI_MONTHS, DEFAULT_* (original)
│   └── invoiceTypes.ts         # InvoiceData, ComputedMeter types (original)
├── app/
│   ├── layout.tsx              # Root layout with SessionProvider
│   ├── page.tsx                # Landing page
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── actions/                # Server Actions (all auth-checked, Zod-validated)
│   │   ├── auth.ts
│   │   ├── buildings.ts
│   │   ├── units.ts
│   │   ├── onboarding.ts
│   │   ├── join-requests.ts
│   │   ├── invoices.ts
│   │   ├── payments.ts
│   │   ├── maintenance.ts
│   │   ├── notifications.ts
│   │   └── settings.ts
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── buildings/search/route.ts
│   ├── (auth)/                 # Auth layout group
│   │   └── auth/signin | signup | verify | reset/
│   ├── (landlord)/             # Landlord layout group (role-guarded)
│   │   └── landlord/...
│   └── (tenant)/              # Tenant layout group (role-guarded)
│       └── tenant/...
├── components/
│   ├── auth/                   # SignUpForm, SignInForm, ResetRequestForm, ResetPasswordForm
│   ├── landlord/               # Sidebar, InvoiceForm
│   ├── tenant/                 # Sidebar, BillCard (PDF download), PaymentProofForm
│   ├── shared/                 # NotificationBell, NotificationList
│   └── pdf/                    # InvoicePDF, pdfStyles (original — unchanged)
└── hooks/
    └── useInvoiceForm.ts       # Original invoice form state hook
```

---

## Useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma Client after schema changes |
| `npx prisma studio` | Open Prisma Studio (GUI for your database) |

---

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import the project in [vercel.com/new](https://vercel.com/new).
3. Add all environment variables from `.env.example` in **Settings → Environment Variables**.
4. Deploy. Vercel automatically runs `npm run build`.
5. After the first deploy, run `npx prisma db push` once from your local machine (pointing at the production `DIRECT_URL`) to initialize the schema in production.

> **Note:** `AUTH_URL` should be set to your production domain, e.g. `https://your-app.vercel.app`.

---

## Troubleshooting

**`DATABASE_URL environment variable is not set`**
Make sure `.env.local` exists and has `DATABASE_URL` set. Never rename it to `.env` — Next.js gives `.env.local` higher priority and keeps it out of git.

**`PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL`**
This only matters for `prisma db push` / `prisma migrate`. Set `DIRECT_URL` in your environment before running migrate commands.

**Email not arriving**
Check your `RESEND_API_KEY` and confirm your `RESEND_FROM` address is a verified sender domain in Resend. In development, Resend's free tier only sends to the account owner's email.

**PDF download button not working**
The PDF renderer (`@react-pdf/renderer`) is loaded client-side only via `next/dynamic`. If the button shows "Preparing PDF…" and stays there, check the browser console for errors related to fonts.

**Blob upload fails**
Ensure `BLOB_READ_WRITE_TOKEN` is set. The token must have **read-write** access, not read-only.
