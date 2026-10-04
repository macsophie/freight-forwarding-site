# Freight Forwarder — Business Decisions & Integration Roadmap

This document captures upcoming technical decisions, third-party carrier integrations, financial setups, and compliance actions needed for full production readiness.

---

## 1. External Integrations & APIs
- [x] **Carrier Tracking Webhook Providers**:
  - [x] Connect ocean tracking EDI / REST webhooks (e.g. project44, Vizion, Terminal49, or direct Maersk/MSC APIs) via `/api/webhooks/carrier`.
  - [x] Connect air cargo tracking (e.g. Champ Cargosystems, SITA, FlightAware) via `/api/webhooks/carrier`.
  - [x] Implement webhook HMAC signature verification in `/api/webhooks/carrier`.
- [x] **Payment Gateways**:
  - [x] Configure Stripe / B2B payment webhook for invoice settlement in `/api/webhooks/payment`.
  - [x] Implement escrow or deposit workflows for high-value container shipments in `src/domain/payments/escrow.ts`.
- [x] **Customs & Compliance**:
  - [x] Integrate Automated Commercial Environment (ACE) / AES Direct for US export declarations (ITN generator & validator) in `src/domain/customs/`.
  - [x] Integrate HMRC CDS / EU NCTS for European customs filings (MRN generator & duty calculator) in `src/domain/customs/`.
  - [x] Implement Customs Holds & Clearance Release workflows in `src/domain/customs/actions.ts`.
- [x] **Transactional Email & Notifications**:
  - [x] Implement multi-channel notification dispatcher (In-app, Resend email adapter, and urgent SMS/WhatsApp alert formatter) in `src/domain/notifications/service.ts` & `templates.ts`.
  - [ ] Set up live production Resend API key and verify domain DNS records (SPF, DKIM, DMARC).
  - [ ] Configure live Twilio/WhatsApp Business API credentials for production SMS dispatch.

---

## 2. Storage & Infrastructure
- [x] **Supabase Storage**:
  - [x] Document upload buffer & multipart handler with SHA-256 integrity checks in `src/domain/documents/upload.ts`.
  - [ ] Create private `documents` bucket in Supabase dashboard / CLI.
  - [ ] Ensure virus scanning webhook on upload.
  - [x] Set signed URL expiration window (default 15 minutes) in `src/domain/documents/actions.ts`.
- [ ] **Object Lifecycles**:
  - [ ] Configure cold storage archive policies for documents older than statutory compliance retention periods (typically 5–7 years).

---

## 3. Business Operations & Workflows
- [x] **Multi-Currency FX Engine**:
  - [x] Connect exchange rate engine with daily conversion rates (USD, EUR, GBP, CNY, AED, SGD) in `src/lib/fx.ts`.
- [x] **Rate Card Engine**:
  - [x] Implement margin matrix based on customer volume tiers and trade lane corridors in `src/lib/rate-card.ts`.
- [x] **Customer Onboarding & KYB**:
  - [x] Automated KYB business verification, tax identification validation (US EIN, EU/UK VAT, etc.), and commercial risk assessment scoring in `src/domain/companies/kyb.ts`.
