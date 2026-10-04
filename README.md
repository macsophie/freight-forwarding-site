# Digital Freight-Forwarding Platform

A modern, production-oriented cloud platform for international freight forwarding, cargo tracking, quoting, booking management, customs documentation, and commercial invoicing. Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL + RLS + Auth + Storage)**.

---

## Key Features

- **Multi-Tenant Customer Portal**: Complete self-service hub for corporate shippers to request instant quotes, convert quotes to bookings, monitor live container/air milestones, securely download bills of lading, and pay invoices.
- **Operations Control Tower (Admin)**: Operational dashboard for freight forwarder staff with role-based segregation (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `OPERATIONS_AGENT`, `FINANCE`, `SUPPORT`).
- **Milestone-Driven Tracking**: Event tracking with standard freight milestones (`BOOKED` &rarr; `DOCUMENTS_PENDING` &rarr; `CARGO_RECEIVED` &rarr; `DEPARTED_ORIGIN` &rarr; `IN_TRANSIT` &rarr; `ARRIVED_DESTINATION` &rarr; `CUSTOMS_CLEARANCE` &rarr; `OUT_FOR_DELIVERY` &rarr; `DELIVERED`).
- **Deep Row-Level Security (RLS)**: True database-enforced multi-tenancy preventing data leaks between distinct client companies.
- **Auditing & Compliance**: Immutable audit logging for all regulatory and administrative actions.
- **Secure Document Vault**: Private storage buckets for Bills of Lading (B/L), Air Waybills (AWB), Packing Lists, and Commercial Invoices accessed via short-lived signed URLs.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Class Variance Authority, clsx
- **Validation & Types**: TypeScript (strict mode), Zod schemas for all domain entities
- **Backend & Database**: Supabase (PostgreSQL 15+), `@supabase/ssr`, Row-Level Security (RLS) policies
- **Architecture**: Domain-Driven Design (DDD) under `src/domain/`

---

## Directory Structure

```
├── .agents/
│   └── rules/freight-forwarder.md      # Permanent engineering rules
├── supabase/
│   └── migrations/                     # PostgreSQL schema, triggers & RLS migrations
├── src/
│   ├── app/
│   │   ├── (public)/                   # Landing, /track, /request-quote
│   │   ├── auth/                       # Login, register, password flows
│   │   ├── portal/                     # Customer Portal
│   │   └── admin/                      # Operations & Staff Control Center
│   ├── components/
│   │   ├── ui/                         # Base design system primitives
│   │   ├── feedback/                   # Loading, error, empty & confirm states
│   │   ├── layout/                     # Sidebar, header, navigation shells
│   │   └── domain/                     # Status badges, tracking timeline, cargo cards
│   ├── domain/                         # Business logic, services & Zod schemas
│   │   ├── auth/                       # Auth roles & helpers
│   │   ├── companies/                  # Multi-tenant corporate accounts
│   │   ├── quotes/                     # Freight quote pricing & issuance
│   │   ├── bookings/                   # Booking contracts & allocation
│   │   ├── shipments/                  # Tracking events & carrier adapters
│   │   ├── documents/                  # Storage paths & signed URLs
│   │   ├── invoices/                   # Billing & tax calculations
│   │   ├── payments/                   # Payment gateway contracts
│   │   ├── notifications/              # In-app & email dispatch
│   │   └── audit/                      # Compliance audit logging
│   ├── lib/                            # Env validation, utility formatters, constants
│   ├── types/                          # Typed database models
│   └── utils/supabase/                 # SSR, browser, and service-role clients
```

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ (tested on Node v22)
- Supabase project (hosted or local CLI)

### 2. Environment Setup
Copy the environment template:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migration
Run the SQL migration in `supabase/migrations/20260830000001_initial_schema.sql` inside your Supabase SQL Editor or with the Supabase CLI:
```bash
supabase db push
```

### 4. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roles & Access Matrix

| Role | Scope | Access |
|---|---|---|
| `SUPER_ADMIN` | Staff | Full system control, audit logs, user management, all companies |
| `OPERATIONS_MANAGER` | Staff | All quotes, bookings, shipments, cargo allocations |
| `OPERATIONS_AGENT` | Staff | Shipment milestone updates, events, document verification |
| `FINANCE` | Staff | Invoices, payment records, accounts receivable, fee waivers |
| `SUPPORT` | Staff | Read-only inspection, customer assistance, notifications |
| `CUSTOMER_ADMIN` | Customer | Company management, quotes, bookings, shipments, billing |
| `CUSTOMER_USER` | Customer | Create quotes, view company shipments & documents |
