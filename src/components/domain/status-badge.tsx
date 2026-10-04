import { Badge } from "@/components/ui/badge";
import {
  ShipmentStatus,
  QuoteStatus,
  BookingStatus,
  InvoiceStatus,
  PaymentStatus,
} from "@/types/database";

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  switch (status) {
    case "DELIVERED":
      return <Badge variant="success">Delivered</Badge>;
    case "OUT_FOR_DELIVERY":
      return <Badge variant="info">Out for Delivery</Badge>;
    case "CUSTOMS_CLEARANCE":
      return <Badge variant="warning">Customs Clearance</Badge>;
    case "ARRIVED_DESTINATION":
      return <Badge variant="info">Arrived at Port</Badge>;
    case "IN_TRANSIT":
      return <Badge variant="default">In Transit</Badge>;
    case "DEPARTED_ORIGIN":
      return <Badge variant="default">Departed Origin</Badge>;
    case "CARGO_RECEIVED":
      return <Badge variant="info">Cargo Received</Badge>;
    case "DOCUMENTS_PENDING":
      return <Badge variant="warning">Docs Pending</Badge>;
    case "BOOKED":
      return <Badge variant="secondary">Booked</Badge>;
    case "ON_HOLD":
      return <Badge variant="destructive">On Hold</Badge>;
    case "CANCELLED":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  switch (status) {
    case "ACCEPTED":
      return <Badge variant="success">Accepted</Badge>;
    case "ISSUED":
      return <Badge variant="info">Quote Issued</Badge>;
    case "REVIEWING":
      return <Badge variant="warning">Under Review</Badge>;
    case "SUBMITTED":
      return <Badge variant="default">Submitted</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Declined</Badge>;
    case "EXPIRED":
      return <Badge variant="outline">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case "CONFIRMED":
      return <Badge variant="success">Confirmed</Badge>;
    case "PROCESSING":
      return <Badge variant="info">Processing</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending Carrier</Badge>;
    case "COMPLETED":
      return <Badge variant="default">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  switch (status) {
    case "PAID":
      return <Badge variant="success">Paid</Badge>;
    case "PARTIALLY_PAID":
      return <Badge variant="info">Partially Paid</Badge>;
    case "ISSUED":
      return <Badge variant="warning">Payment Due</Badge>;
    case "OVERDUE":
      return <Badge variant="destructive">Overdue</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "CANCELLED":
    case "VOID":
      return <Badge variant="outline">Void</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "SUCCEEDED":
      return <Badge variant="success">Succeeded</Badge>;
    case "PENDING":
      return <Badge variant="warning">Processing</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    case "REFUNDED":
      return <Badge variant="secondary">Refunded</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
