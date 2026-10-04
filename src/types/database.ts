export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'OPERATIONS_AGENT'
  | 'FINANCE'
  | 'SUPPORT'
  | 'CUSTOMER_ADMIN'
  | 'CUSTOMER_USER';

export type ShipmentMode =
  | 'OCEAN_FCL'
  | 'OCEAN_LCL'
  | 'AIR'
  | 'ROAD'
  | 'RAIL';

export type Incoterm =
  | 'EXW'
  | 'FOB'
  | 'CIF'
  | 'DDP'
  | 'DAP'
  | 'FCA'
  | 'CPT'
  | 'CIP';

export type QuoteStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'REVIEWING'
  | 'ISSUED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'CANCELLED'
  | 'COMPLETED';

export type ShipmentStatus =
  | 'BOOKED'
  | 'DOCUMENTS_PENDING'
  | 'CARGO_RECEIVED'
  | 'DEPARTED_ORIGIN'
  | 'IN_TRANSIT'
  | 'ARRIVED_DESTINATION'
  | 'CUSTOMS_CLEARANCE'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type DocumentType =
  | 'BILL_OF_LADING'
  | 'AIR_WAYBILL'
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'CUSTOMS_DECLARATION'
  | 'INSURANCE_CERTIFICATE'
  | 'DELIVERY_ORDER'
  | 'OTHER';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'VOID';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED';

export type CompanyStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'INACTIVE';

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          tax_id: string | null;
          eori_number: string | null;
          registration_number: string | null;
          industry: string | null;
          website: string | null;
          phone: string | null;
          email: string;
          status: CompanyStatus;
          credit_limit: number;
          currency: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          tax_id?: string | null;
          eori_number?: string | null;
          registration_number?: string | null;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          email: string;
          status?: CompanyStatus;
          credit_limit?: number;
          currency?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          role: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          job_title: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id?: string | null;
          role?: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          job_title?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: UserRole;
          is_primary_contact: boolean;
          joined_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role?: UserRole;
          is_primary_contact?: boolean;
          joined_at?: string;
        };
        Update: Partial<Database['public']['Tables']['company_users']['Insert']>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          company_id: string;
          label: string | null;
          company_name: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          street_address: string;
          address_line_2: string | null;
          city: string;
          state_province: string | null;
          postal_code: string | null;
          country_code: string;
          port_code: string | null;
          is_port_or_airport: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          label?: string | null;
          company_name?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          street_address: string;
          address_line_2?: string | null;
          city: string;
          state_province?: string | null;
          postal_code?: string | null;
          country_code: string;
          port_code?: string | null;
          is_port_or_airport?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          company_id: string;
          requested_by: string | null;
          assigned_to: string | null;
          mode: ShipmentMode;
          incoterm: Incoterm;
          origin_address_id: string | null;
          destination_address_id: string | null;
          origin_port: string | null;
          destination_port: string | null;
          cargo_ready_date: string;
          target_delivery_date: string | null;
          estimated_transit_days: number | null;
          status: QuoteStatus;
          currency: string;
          freight_charge: number;
          origin_charges: number;
          destination_charges: number;
          customs_charges: number;
          insurance_charge: number;
          total_amount: number;
          valid_until: string | null;
          special_instructions: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quote_number: string;
          company_id: string;
          requested_by?: string | null;
          assigned_to?: string | null;
          mode: ShipmentMode;
          incoterm: Incoterm;
          origin_address_id?: string | null;
          destination_address_id?: string | null;
          origin_port?: string | null;
          destination_port?: string | null;
          cargo_ready_date: string;
          target_delivery_date?: string | null;
          estimated_transit_days?: number | null;
          status?: QuoteStatus;
          currency?: string;
          freight_charge?: number;
          origin_charges?: number;
          destination_charges?: number;
          customs_charges?: number;
          insurance_charge?: number;
          total_amount?: number;
          valid_until?: string | null;
          special_instructions?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
        Relationships: [];
      };
      quote_items: {
        Row: {
          id: string;
          quote_id: string;
          package_type: string;
          quantity: number;
          length_cm: number | null;
          width_cm: number | null;
          height_cm: number | null;
          gross_weight_kg: number;
          volumetric_weight_kg: number | null;
          total_volume_cbm: number;
          commodity_description: string;
          hs_code: string | null;
          is_hazardous: boolean;
          un_number: string | null;
          hazard_class: string | null;
          temperature_control: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_id: string;
          package_type: string;
          quantity: number;
          length_cm?: number | null;
          width_cm?: number | null;
          height_cm?: number | null;
          gross_weight_kg: number;
          volumetric_weight_kg?: number | null;
          total_volume_cbm: number;
          commodity_description: string;
          hs_code?: string | null;
          is_hazardous?: boolean;
          un_number?: string | null;
          hazard_class?: string | null;
          temperature_control?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quote_items']['Insert']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          booking_number: string;
          company_id: string;
          quote_id: string | null;
          created_by: string | null;
          carrier_name: string | null;
          carrier_booking_reference: string | null;
          status: BookingStatus;
          cargo_cutoff_date: string | null;
          document_cutoff_date: string | null;
          estimated_departure_date: string | null;
          estimated_arrival_date: string | null;
          special_requirements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_number: string;
          company_id: string;
          quote_id?: string | null;
          created_by?: string | null;
          carrier_name?: string | null;
          carrier_booking_reference?: string | null;
          status?: BookingStatus;
          cargo_cutoff_date?: string | null;
          document_cutoff_date?: string | null;
          estimated_departure_date?: string | null;
          estimated_arrival_date?: string | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
        Relationships: [];
      };
      shipments: {
        Row: {
          id: string;
          shipment_number: string;
          tracking_number: string;
          company_id: string;
          booking_id: string | null;
          quote_id: string | null;
          mode: ShipmentMode;
          incoterm: Incoterm;
          status: ShipmentStatus;
          carrier_name: string | null;
          vessel_flight_number: string | null;
          voyage_number: string | null;
          master_bill_of_lading: string | null;
          house_bill_of_lading: string | null;
          origin_name: string;
          origin_port: string;
          origin_country: string;
          destination_name: string;
          destination_port: string;
          destination_country: string;
          consignee_name: string | null;
          shipper_name: string | null;
          container_numbers: string[] | null;
          total_packages: number;
          total_gross_weight_kg: number;
          total_volume_cbm: number;
          commodity_summary: string;
          etd: string | null;
          eta: string | null;
          actual_departure: string | null;
          actual_arrival: string | null;
          delivered_at: string | null;
          current_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_number: string;
          tracking_number: string;
          company_id: string;
          booking_id?: string | null;
          quote_id?: string | null;
          mode: ShipmentMode;
          incoterm: Incoterm;
          status?: ShipmentStatus;
          carrier_name?: string | null;
          vessel_flight_number?: string | null;
          voyage_number?: string | null;
          master_bill_of_lading?: string | null;
          house_bill_of_lading?: string | null;
          origin_name: string;
          origin_port: string;
          origin_country: string;
          destination_name: string;
          destination_port: string;
          destination_country: string;
          consignee_name?: string | null;
          shipper_name?: string | null;
          container_numbers?: string[] | null;
          total_packages?: number;
          total_gross_weight_kg: number;
          total_volume_cbm: number;
          commodity_summary: string;
          etd?: string | null;
          eta?: string | null;
          actual_departure?: string | null;
          actual_arrival?: string | null;
          delivered_at?: string | null;
          current_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shipments']['Insert']>;
        Relationships: [];
      };
      shipment_events: {
        Row: {
          id: string;
          shipment_id: string;
          status: ShipmentStatus;
          event_title: string;
          event_description: string | null;
          location_name: string;
          location_country: string | null;
          occurred_at: string;
          recorded_by: string | null;
          source: 'MANUAL' | 'CARRIER_EDI' | 'CARRIER_API' | 'SYSTEM';
          is_milestone: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          status: ShipmentStatus;
          event_title: string;
          event_description?: string | null;
          location_name: string;
          location_country?: string | null;
          occurred_at: string;
          recorded_by?: string | null;
          source?: 'MANUAL' | 'CARRIER_EDI' | 'CARRIER_API' | 'SYSTEM';
          is_milestone?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shipment_events']['Insert']>;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          company_id: string;
          shipment_id: string | null;
          quote_id: string | null;
          document_type: DocumentType;
          title: string;
          file_name: string;
          file_path: string;
          file_size_bytes: number;
          mime_type: string;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          shipment_id?: string | null;
          quote_id?: string | null;
          document_type: DocumentType;
          title: string;
          file_name: string;
          file_path: string;
          file_size_bytes: number;
          mime_type: string;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          company_id: string;
          shipment_id: string | null;
          quote_id: string | null;
          status: InvoiceStatus;
          currency: string;
          subtotal: number;
          tax_rate_percent: number;
          tax_amount: number;
          total_amount: number;
          paid_amount: number;
          balance_due: number;
          issue_date: string;
          due_date: string;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          company_id: string;
          shipment_id?: string | null;
          quote_id?: string | null;
          status?: InvoiceStatus;
          currency?: string;
          subtotal: number;
          tax_rate_percent?: number;
          tax_amount?: number;
          total_amount: number;
          paid_amount?: number;
          balance_due: number;
          issue_date?: string;
          due_date: string;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          charge_category: string;
          quantity: number;
          unit_price: number;
          amount: number;
          is_taxable: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          charge_category: string;
          quantity?: number;
          unit_price: number;
          amount: number;
          is_taxable?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          payment_reference: string;
          company_id: string;
          invoice_id: string;
          amount: number;
          currency: string;
          payment_method: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'ACH_DIRECT_DEBIT' | 'CHECK' | 'WIRE';
          status: PaymentStatus;
          transaction_id: string | null;
          processed_at: string | null;
          recorded_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_reference: string;
          company_id: string;
          invoice_id: string;
          amount: number;
          currency?: string;
          payment_method: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'ACH_DIRECT_DEBIT' | 'CHECK' | 'WIRE';
          status?: PaymentStatus;
          transaction_id?: string | null;
          processed_at?: string | null;
          recorded_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          title: string;
          message: string;
          category: 'SHIPMENT' | 'QUOTE' | 'INVOICE' | 'DOCUMENT' | 'SYSTEM';
          reference_id: string | null;
          reference_type: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          title: string;
          message: string;
          category: 'SHIPMENT' | 'QUOTE' | 'INVOICE' | 'DOCUMENT' | 'SYSTEM';
          reference_id?: string | null;
          reference_type?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string;
          actor_role: UserRole;
          company_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          changes: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email: string;
          actor_role: UserRole;
          company_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
