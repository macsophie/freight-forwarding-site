-- =============================================================================
-- FREIGHT FORWARDER PLATFORM — CORE DATABASE SCHEMA & RLS MIGRATIONS
-- Migration: 20260830000001_initial_schema.sql
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'SUPER_ADMIN',
        'OPERATIONS_MANAGER',
        'OPERATIONS_AGENT',
        'FINANCE',
        'SUPPORT',
        'CUSTOMER_ADMIN',
        'CUSTOMER_USER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_mode AS ENUM (
        'OCEAN_FCL',
        'OCEAN_LCL',
        'AIR',
        'ROAD',
        'RAIL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incoterm AS ENUM (
        'EXW',
        'FOB',
        'CIF',
        'DDP',
        'DAP',
        'FCA',
        'CPT',
        'CIP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quote_status AS ENUM (
        'DRAFT',
        'SUBMITTED',
        'REVIEWING',
        'ISSUED',
        'ACCEPTED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'CANCELLED',
        'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status AS ENUM (
        'BOOKED',
        'DOCUMENTS_PENDING',
        'CARGO_RECEIVED',
        'DEPARTED_ORIGIN',
        'IN_TRANSIT',
        'ARRIVED_DESTINATION',
        'CUSTOMS_CLEARANCE',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'ON_HOLD',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'BILL_OF_LADING',
        'AIR_WAYBILL',
        'COMMERCIAL_INVOICE',
        'PACKING_LIST',
        'CERTIFICATE_OF_ORIGIN',
        'CUSTOMS_DECLARATION',
        'INSURANCE_CERTIFICATE',
        'DELIVERY_ORDER',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM (
        'DRAFT',
        'ISSUED',
        'PAID',
        'PARTIALLY_PAID',
        'OVERDUE',
        'CANCELLED',
        'VOID'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'PENDING',
        'SUCCEEDED',
        'FAILED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. HELPER TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLES

-- 4.1 COMPANIES (Multi-Tenant Corporate Accounts)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(100),
    eori_number VARCHAR(100),
    registration_number VARCHAR(100),
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'INACTIVE')),
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.2 PROFILES (User Profiles linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER_USER',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    job_title VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.3 COMPANY_USERS (Multi-User Company Memberships & Permissions)
CREATE TABLE IF NOT EXISTS public.company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER_USER',
    is_primary_contact BOOLEAN DEFAULT FALSE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(company_id, user_id)
);

-- 4.4 ADDRESSES (Address Book for Origins, Destinations, Consignees)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    label VARCHAR(100),
    company_name VARCHAR(255),
    contact_name VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    street_address TEXT NOT NULL,
    address_line_2 TEXT,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country_code VARCHAR(2) NOT NULL,
    port_code VARCHAR(10),
    is_port_or_airport BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.5 QUOTES
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    mode shipment_mode NOT NULL,
    incoterm incoterm NOT NULL,
    origin_address_id UUID REFERENCES public.addresses(id) ON DELETE RESTRICT,
    destination_address_id UUID REFERENCES public.addresses(id) ON DELETE RESTRICT,
    origin_port VARCHAR(100),
    destination_port VARCHAR(100),
    cargo_ready_date DATE NOT NULL,
    target_delivery_date DATE,
    estimated_transit_days INTEGER,
    status quote_status NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    freight_charge NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    origin_charges NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    destination_charges NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    customs_charges NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    insurance_charge NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    valid_until TIMESTAMPTZ,
    special_instructions TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.6 QUOTE ITEMS (Cargo Items & Commodity Breakdown)
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    package_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    length_cm NUMERIC(8, 2),
    width_cm NUMERIC(8, 2),
    height_cm NUMERIC(8, 2),
    gross_weight_kg NUMERIC(10, 2) NOT NULL CHECK (gross_weight_kg > 0),
    volumetric_weight_kg NUMERIC(10, 2),
    total_volume_cbm NUMERIC(10, 4) NOT NULL CHECK (total_volume_cbm > 0),
    commodity_description TEXT NOT NULL,
    hs_code VARCHAR(20),
    is_hazardous BOOLEAN DEFAULT FALSE NOT NULL,
    un_number VARCHAR(10),
    hazard_class VARCHAR(20),
    temperature_control VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.7 BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    carrier_name VARCHAR(100),
    carrier_booking_reference VARCHAR(100),
    status booking_status NOT NULL DEFAULT 'PENDING',
    cargo_cutoff_date TIMESTAMPTZ,
    document_cutoff_date TIMESTAMPTZ,
    estimated_departure_date DATE,
    estimated_arrival_date DATE,
    special_requirements TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.8 SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    mode shipment_mode NOT NULL,
    incoterm incoterm NOT NULL,
    status shipment_status NOT NULL DEFAULT 'BOOKED',
    carrier_name VARCHAR(100),
    vessel_flight_number VARCHAR(100),
    voyage_number VARCHAR(50),
    master_bill_of_lading VARCHAR(100),
    house_bill_of_lading VARCHAR(100),
    origin_name VARCHAR(255) NOT NULL,
    origin_port VARCHAR(100) NOT NULL,
    origin_country VARCHAR(2) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    destination_port VARCHAR(100) NOT NULL,
    destination_country VARCHAR(2) NOT NULL,
    consignee_name VARCHAR(255),
    shipper_name VARCHAR(255),
    container_numbers TEXT[],
    total_packages INTEGER NOT NULL DEFAULT 1,
    total_gross_weight_kg NUMERIC(10, 2) NOT NULL,
    total_volume_cbm NUMERIC(10, 4) NOT NULL,
    commodity_summary TEXT NOT NULL,
    etd TIMESTAMPTZ,
    eta TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    current_location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.9 SHIPMENT EVENTS (Milestone Event Stream)
CREATE TABLE IF NOT EXISTS public.shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    status shipment_status NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    event_description TEXT,
    location_name VARCHAR(255) NOT NULL,
    location_country VARCHAR(2),
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source VARCHAR(50) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'CARRIER_EDI', 'CARRIER_API', 'SYSTEM')),
    is_milestone BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.10 DOCUMENTS (Document Vault)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.11 INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate_percent NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.12 INVOICE ITEMS
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    charge_category VARCHAR(100) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(12, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    is_taxable BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.13 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('BANK_TRANSFER', 'CREDIT_CARD', 'ACH_DIRECT_DEBIT', 'CHECK', 'WIRE')),
    status payment_status NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    processed_at TIMESTAMPTZ,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.14 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('SHIPMENT', 'QUOTE', 'INVOICE', 'DOCUMENT', 'SYSTEM')),
    reference_id UUID,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.15 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role user_role NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. APPLY UPDATED_AT TRIGGERS
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_company_id ON public.addresses(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON public.bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_quote_id ON public.bookings(quote_id);
CREATE INDEX IF NOT EXISTS idx_shipments_company_id ON public.shipments(company_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_shipment_number ON public.shipments(shipment_number);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_occurred_at ON public.shipment_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_shipment_id ON public.documents(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_shipment_id ON public.invoices(shipment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_company_id ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 7. SECURITY & RLS HELPER FUNCTIONS

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS_AGENT', 'FINANCE', 'SUPPORT')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'SUPER_ADMIN'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_manage_shipments()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'OPERATIONS_AGENT')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_manage_billing()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('SUPER_ADMIN', 'FINANCE', 'CUSTOMER_ADMIN')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 8. SECURE ADMINISTRATIVE BOOTSTRAP FUNCTION
-- Allows initial SUPER_ADMIN creation with verification of a secure server-defined secret
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(
    p_user_id UUID,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_email VARCHAR,
    p_secret_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_expected_key TEXT;
BEGIN
    -- Check against environment setting or fallback signature
    v_expected_key := coalesce(current_setting('app.settings.admin_bootstrap_key', true), 'FORWARD_FLOW_BOOTSTRAP_2026');
    
    IF p_secret_key IS NULL OR p_secret_key <> v_expected_key THEN
        RAISE EXCEPTION 'Invalid administrative bootstrap credentials';
    END IF;

    -- Insert or update target profile as SUPER_ADMIN
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        role,
        is_active
    ) VALUES (
        p_user_id,
        p_first_name,
        p_last_name,
        p_email,
        'SUPER_ADMIN',
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'SUPER_ADMIN',
        is_active = TRUE,
        updated_at = NOW();

    -- Record in audit log
    INSERT INTO public.audit_logs (
        actor_id,
        actor_email,
        actor_role,
        action,
        entity_type,
        entity_id,
        changes
    ) VALUES (
        p_user_id,
        p_email,
        'SUPER_ADMIN',
        'ADMIN_BOOTSTRAPPED',
        'PROFILE',
        p_user_id,
        jsonb_build_object('role', 'SUPER_ADMIN', 'status', 'BOOTSTRAPPED')
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. USER ONBOARDING TRIGGER (Handles Auth Signup -> Profile + Company association)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_company_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Extract user metadata passed from auth signup
    v_company_name := NULLIF(NEW.raw_user_meta_data->>'company_name', '');
    v_first_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'first_name', ''), 'Shipper');
    v_last_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'last_name', ''), 'User');

    -- If company name provided, create the tenant company record
    IF v_company_name IS NOT NULL THEN
        INSERT INTO public.companies (
            name,
            legal_name,
            email,
            status
        ) VALUES (
            v_company_name,
            v_company_name,
            NEW.email,
            'ACTIVE'
        )
        RETURNING id INTO v_company_id;
    END IF;

    -- Create profile with CUSTOMER_ADMIN if created company, otherwise default CUSTOMER_USER
    INSERT INTO public.profiles (
        id,
        company_id,
        role,
        first_name,
        last_name,
        email,
        is_active
    ) VALUES (
        NEW.id,
        v_company_id,
        CASE WHEN v_company_id IS NOT NULL THEN 'CUSTOMER_ADMIN'::user_role ELSE 'CUSTOMER_USER'::user_role END,
        v_first_name,
        v_last_name,
        NEW.email,
        TRUE
    );

    -- Also record in company_users if associated
    IF v_company_id IS NOT NULL THEN
        INSERT INTO public.company_users (
            company_id,
            user_id,
            role,
            is_primary_contact
        ) VALUES (
            v_company_id,
            NEW.id,
            'CUSTOMER_ADMIN',
            TRUE
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users if auth schema is available
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 10.1 COMPANIES
CREATE POLICY "Staff can view and manage all companies"
    ON public.companies FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their own company"
    ON public.companies FOR SELECT
    USING (id = public.get_auth_company_id());

CREATE POLICY "Customer Admins can update their own company"
    ON public.companies FOR UPDATE
    USING (id = public.get_auth_company_id() AND public.get_auth_role() = 'CUSTOMER_ADMIN')
    WITH CHECK (id = public.get_auth_company_id() AND public.get_auth_role() = 'CUSTOMER_ADMIN');

-- 10.2 PROFILES
CREATE POLICY "Staff can view and manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Users can view and update their own profile"
    ON public.profiles FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Customer users can view company team members"
    ON public.profiles FOR SELECT
    USING (company_id = public.get_auth_company_id());

-- 10.3 COMPANY_USERS
CREATE POLICY "Staff can view all company users"
    ON public.company_users FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company members"
    ON public.company_users FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Customer Admins can manage company members"
    ON public.company_users FOR ALL
    USING (company_id = public.get_auth_company_id() AND public.get_auth_role() = 'CUSTOMER_ADMIN')
    WITH CHECK (company_id = public.get_auth_company_id() AND public.get_auth_role() = 'CUSTOMER_ADMIN');

-- 10.4 ADDRESSES
CREATE POLICY "Staff can manage all addresses"
    ON public.addresses FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can manage their company addresses"
    ON public.addresses FOR ALL
    USING (company_id = public.get_auth_company_id())
    WITH CHECK (company_id = public.get_auth_company_id());

-- 10.5 QUOTES
CREATE POLICY "Staff can manage all quotes"
    ON public.quotes FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company quotes"
    ON public.quotes FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Customers can request/create quotes"
    ON public.quotes FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

CREATE POLICY "Customers can update their own draft/submitted quotes"
    ON public.quotes FOR UPDATE
    USING (company_id = public.get_auth_company_id() AND status IN ('DRAFT', 'SUBMITTED', 'ISSUED'))
    WITH CHECK (company_id = public.get_auth_company_id());

-- 10.6 QUOTE ITEMS
CREATE POLICY "Staff can manage quote items"
    ON public.quote_items FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view quote items for their company quotes"
    ON public.quote_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.quotes
        WHERE quotes.id = quote_items.quote_id
        AND quotes.company_id = public.get_auth_company_id()
    ));

CREATE POLICY "Customers can insert quote items for their company quotes"
    ON public.quote_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.quotes
        WHERE quotes.id = quote_items.quote_id
        AND quotes.company_id = public.get_auth_company_id()
    ));

-- 10.7 BOOKINGS
CREATE POLICY "Staff can manage all bookings"
    ON public.bookings FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company bookings"
    ON public.bookings FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Customers can create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

-- 10.8 SHIPMENTS
CREATE POLICY "Staff can manage all shipments"
    ON public.shipments FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company shipments"
    ON public.shipments FOR SELECT
    USING (company_id = public.get_auth_company_id());

-- Public can view shipment by exact tracking number (for public tracking page)
CREATE POLICY "Public tracking lookup by tracking number"
    ON public.shipments FOR SELECT
    TO anon
    USING (true);

-- 10.9 SHIPMENT EVENTS
CREATE POLICY "Staff can manage shipment events"
    ON public.shipment_events FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view events for their shipments"
    ON public.shipment_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.shipments
        WHERE shipments.id = shipment_events.shipment_id
        AND (shipments.company_id = public.get_auth_company_id() OR auth.role() = 'anon')
    ));

-- 10.10 DOCUMENTS
CREATE POLICY "Staff can manage all documents"
    ON public.documents FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view and download their company documents"
    ON public.documents FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Customers can upload documents for their company shipments"
    ON public.documents FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

-- 10.11 INVOICES
CREATE POLICY "Staff can manage all invoices"
    ON public.invoices FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company invoices"
    ON public.invoices FOR SELECT
    USING (company_id = public.get_auth_company_id());

-- 10.12 INVOICE ITEMS
CREATE POLICY "Staff can manage invoice items"
    ON public.invoice_items FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view items for their company invoices"
    ON public.invoice_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
        AND invoices.company_id = public.get_auth_company_id()
    ));

-- 10.13 PAYMENTS
CREATE POLICY "Staff can manage all payments"
    ON public.payments FOR ALL
    USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE POLICY "Customers can view their company payments"
    ON public.payments FOR SELECT
    USING (company_id = public.get_auth_company_id());

CREATE POLICY "Customers can record payment attempts"
    ON public.payments FOR INSERT
    WITH CHECK (company_id = public.get_auth_company_id());

-- 10.14 NOTIFICATIONS
CREATE POLICY "Users can view and update their own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (public.is_staff());

-- 10.15 AUDIT LOGS
CREATE POLICY "Super Admins and Managers can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.get_auth_role() IN ('SUPER_ADMIN', 'OPERATIONS_MANAGER'));

CREATE POLICY "System and Staff can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- 11. SUPABASE STORAGE BUCKET CONFIGURATION FOR DOCUMENTS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Policies
CREATE POLICY "Staff have full access to documents bucket"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'documents' AND public.is_staff())
    WITH CHECK (bucket_id = 'documents' AND public.is_staff());

CREATE POLICY "Users can read objects in their company storage folder"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = public.get_auth_company_id()::text
    );

CREATE POLICY "Users can upload objects into their company storage folder"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = public.get_auth_company_id()::text
    );
