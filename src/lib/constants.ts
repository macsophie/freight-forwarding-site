import { ShipmentStatus, ShipmentMode, Incoterm, UserRole } from "@/types/database";

export const APP_NAME = "ForwardFlow Logistics";
export const APP_TAGLINE = "Intelligent Global Freight Forwarding Platform";

export interface MilestoneDefinition {
  status: ShipmentStatus;
  label: string;
  shortLabel: string;
  description: string;
  step: number;
}

export const SHIPMENT_MILESTONES: MilestoneDefinition[] = [
  {
    status: "BOOKED",
    label: "Booking Confirmed",
    shortLabel: "Booked",
    description: "Cargo booking accepted and vessel/flight space allocated",
    step: 1,
  },
  {
    status: "DOCUMENTS_PENDING",
    label: "Documents Pending",
    shortLabel: "Docs Pending",
    description: "Export clearance, commercial invoice, and packing lists being verified",
    step: 2,
  },
  {
    status: "CARGO_RECEIVED",
    label: "Cargo Received",
    shortLabel: "Received",
    description: "Cargo checked-in at origin container freight station or airport terminal",
    step: 3,
  },
  {
    status: "DEPARTED_ORIGIN",
    label: "Departed Origin",
    shortLabel: "Departed",
    description: "Vessel/flight departed origin gateway port",
    step: 4,
  },
  {
    status: "IN_TRANSIT",
    label: "In Transit",
    shortLabel: "In Transit",
    description: "Shipment actively traversing international transit corridor",
    step: 5,
  },
  {
    status: "ARRIVED_DESTINATION",
    label: "Arrived at Destination",
    shortLabel: "Arrived",
    description: "Vessel/flight arrived at destination discharge port",
    step: 6,
  },
  {
    status: "CUSTOMS_CLEARANCE",
    label: "Customs Clearance",
    shortLabel: "Customs",
    description: "Import declaration filed and duty assessment under processing",
    step: 7,
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    shortLabel: "Out for Delivery",
    description: "Last-mile drayage / courier dispatched to consignee facility",
    step: 8,
  },
  {
    status: "DELIVERED",
    label: "Delivered & Completed",
    shortLabel: "Delivered",
    description: "Proof of Delivery (POD) signed and consignment finalized",
    step: 9,
  },
];

export const SHIPMENT_MODES: { value: ShipmentMode; label: string; icon: string; description: string }[] = [
  {
    value: "OCEAN_FCL",
    label: "Ocean (FCL)",
    icon: "Ship",
    description: "Full Container Load (20ft, 40ft, 40ft HC) for high volume cargo",
  },
  {
    value: "OCEAN_LCL",
    label: "Ocean (LCL)",
    icon: "Boxes",
    description: "Less than Container Load — cost-effective consolidated sea freight",
  },
  {
    value: "AIR",
    label: "Air Freight",
    icon: "Plane",
    description: "Expedited international air cargo with rapid customs clearance",
  },
  {
    value: "ROAD",
    label: "Road / Trucking",
    icon: "Truck",
    description: "Cross-border FTL and LTL trucking network with GPS tracking",
  },
  {
    value: "RAIL",
    label: "Rail Freight",
    icon: "Train",
    description: "Eco-friendly trans-continental multimodal rail corridors",
  },
];

export const INCOTERMS: { value: Incoterm; label: string; short: string }[] = [
  { value: "FOB", label: "FOB — Free on Board", short: "Free on Board" },
  { value: "CIF", label: "CIF — Cost, Insurance & Freight", short: "Cost, Insurance & Freight" },
  { value: "EXW", label: "EXW — Ex Works", short: "Ex Works" },
  { value: "DDP", label: "DDP — Delivered Duty Paid", short: "Delivered Duty Paid" },
  { value: "DAP", label: "DAP — Delivered at Place", short: "Delivered at Place" },
  { value: "FCA", label: "FCA — Free Carrier", short: "Free Carrier" },
  { value: "CPT", label: "CPT — Carriage Paid To", short: "Carriage Paid To" },
  { value: "CIP", label: "CIP — Carriage and Insurance Paid To", short: "Carriage & Insurance Paid To" },
];

export const USER_ROLES: { value: UserRole; label: string; isStaff: boolean }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin", isStaff: true },
  { value: "OPERATIONS_MANAGER", label: "Operations Manager", isStaff: true },
  { value: "OPERATIONS_AGENT", label: "Operations Agent", isStaff: true },
  { value: "FINANCE", label: "Finance Officer", isStaff: true },
  { value: "SUPPORT", label: "Customer Support", isStaff: true },
  { value: "CUSTOMER_ADMIN", label: "Company Administrator", isStaff: false },
  { value: "CUSTOMER_USER", label: "Company User", isStaff: false },
];

export const PORTAL_NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/dashboard", icon: "LayoutDashboard" },
  { label: "Quotes", href: "/portal/quotes", icon: "FileSpreadsheet" },
  { label: "Bookings", href: "/portal/bookings", icon: "CalendarCheck" },
  { label: "Shipments", href: "/portal/shipments", icon: "Ship" },
  { label: "Document Vault", href: "/portal/documents", icon: "FolderLock" },
  { label: "Invoices & Billing", href: "/portal/invoices", icon: "Receipt" },
  { label: "Notifications", href: "/portal/notifications", icon: "Bell" },
  { label: "Company Settings", href: "/portal/settings", icon: "Settings" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Control Tower", href: "/admin/dashboard", icon: "Gauge" },
  { label: "Customers", href: "/admin/customers", icon: "Building2" },
  { label: "Quotes Queue", href: "/admin/quotes", icon: "FileText" },
  { label: "Bookings Queue", href: "/admin/bookings", icon: "CalendarRange" },
  { label: "Shipments Console", href: "/admin/shipments", icon: "Ship" },
  { label: "Document Vault", href: "/admin/documents", icon: "Files" },
  { label: "Invoices & AR", href: "/admin/invoices", icon: "DollarSign" },
  { label: "Payments", href: "/admin/payments", icon: "CreditCard" },
  { label: "Users & RBAC", href: "/admin/users", icon: "Users" },
  { label: "Notifications", href: "/admin/notifications", icon: "BellRing" },
  { label: "System Settings", href: "/admin/settings", icon: "Sliders" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "ShieldCheck" },
];
