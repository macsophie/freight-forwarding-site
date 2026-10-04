# Permanent Engineering Rules — Freight Forwarder Platform

These rules govern all architectural, design, backend, frontend, database, and operational practices for the Digital Freight-Forwarding Platform codebase.

---

## 1. Architectural Principles
- **Domain-Driven Design (DDD)**: Code is organized by domain in `src/domain/` (e.g. `quotes`, `bookings`, `shipments`, `documents`, `invoices`, `payments`, `notifications`, `audit`). Each domain encapsulates its validation schemas, types, and business operations.
- **Strict Typing & Schema Validation**:
  - All input/output boundaries (Forms, Server Actions, Route Handlers) MUST be validated with Zod.
  - Zero `any` types. All database entities must adhere to typed definitions in `src/types/database.ts`.
- **Stateless Authentication & RLS**:
  - Authentication is handled exclusively via Supabase Auth.
  - Data isolation and security MUST be enforced at the database level using PostgreSQL Row-Level Security (RLS). Application-level filtering is only a convenience, never a security boundary.

---

## 2. Role-Based Access Control (RBAC)
The platform strictly distinguishes between internal staff and external customer roles:
- **Staff Roles**:
  - `SUPER_ADMIN`: Full systemic authority, system settings, user management, and audit logs.
  - `OPERATIONS_MANAGER`: Quotes, bookings, shipments, cargo allocations, operational staff supervision.
  - `OPERATIONS_AGENT`: Day-to-day milestone updates, tracking events, document verification.
  - `FINANCE`: Invoicing, payments, accounts receivable, fee adjustments.
  - `SUPPORT`: Read-only customer inspection, support ticket handling, notification dispatch.
- **Customer Roles**:
  - `CUSTOMER_ADMIN`: Company administrator with authority over company shipments, quotes, billing, and team members.
  - `CUSTOMER_USER`: Authorized company member with read/create permissions on company freight records.

---

## 3. Freight Tracking & Milestones
- **No Mock or Fake Carrier Tracking**: Tracking is based strictly on an extensible milestone event model:
  1. `BOOKED` — Booking confirmed by carrier/forwarder
  2. `DOCUMENTS_PENDING` — Awaiting customs/export documentation
  3. `CARGO_RECEIVED` — Cargo received at origin CFS/CY
  4. `DEPARTED_ORIGIN` — Vessel/Flight departed origin port
  5. `IN_TRANSIT` — En route across international transit corridor
  6. `ARRIVED_DESTINATION` — Vessel/Flight arrived at destination port
  7. `CUSTOMS_CLEARANCE` — Under customs processing & duty assessment
  8. `OUT_FOR_DELIVERY` — Last-mile drayage/courier delivery
  9. `DELIVERED` — POD received and shipment completed
- **Carrier Integration Ready**: Carrier adapters must implement the `CarrierTrackingAdapter` interface to allow seamless plug-in of ocean/air tracking webhooks (e.g. Maersk, MSC, Ocean Insights, FlightAware).

---

## 4. UI & UX Standards
- **Design Language**: Deep modern slate/navy base with vibrant cyan/emerald/amber status indicators, high-contrast typography, and accessible UI controls.
- **Feedback & States**:
  - Every asynchronous view MUST provide Loading, Empty, and Error states using components from `src/components/feedback/`.
  - All destructive actions require confirmation dialogs.
- **Formatting Utilities**:
  - Currency amounts MUST be formatted with `formatCurrency()` (defaults to USD with multi-currency support).
  - Weights & volumes MUST use `formatWeight()` (KG/LBS) and `formatCBM()` (m³).

---

## 5. Security & Multi-Tenancy
- Customers can NEVER access records belonging to another `company_id`.
- Documents stored in Supabase Storage MUST be stored in private buckets with path prefixes (`{company_id}/{shipment_id}/{file_id}`) and accessed via short-lived signed URLs.
- All administrative mutations must write an audit record to the `audit_logs` table.
