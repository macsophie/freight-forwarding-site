/**
 * Responsive HTML Email & Urgent SMS Formatter for International Freight Events.
 */

export interface BookingConfirmationEmailProps {
  bookingRef: string;
  shipperName: string;
  originPort: string;
  destinationPort: string;
  carrierName: string;
  vesselOrFlight: string;
  cargoDescription: string;
}

export interface MilestoneEmailProps {
  trackingNumber: string;
  shipperName: string;
  milestoneTitle: string;
  status: string;
  location: string;
  description: string;
  occurredAt: string;
}

export interface CustomsHoldEmailProps {
  trackingNumber: string;
  shipperName: string;
  authority: string;
  location: string;
  holdReason: string;
  actionRequired: string;
}

export interface InvoiceIssuedEmailProps {
  invoiceNumber: string;
  trackingNumber: string;
  shipperName: string;
  totalAmount: number;
  currency: string;
  dueDate: string;
}

export function renderBookingConfirmationEmail(props: BookingConfirmationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation — ${props.bookingRef}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px;">
    <div style="border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">FORWARD<span style="color: #fff;">FLOW</span> LOGISTICS</h2>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Carrier Booking Confirmation & Space Allocation</p>
    </div>

    <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${props.shipperName}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
      Carrier space has been officially confirmed for booking reference <strong style="color: #38bdf8; font-family: monospace;">${props.bookingRef}</strong>.
    </p>

    <div style="background: #0f172a; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #334155;">
      <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Route:</td>
          <td style="padding: 6px 0; font-weight: bold;">${props.originPort} &rarr; ${props.destinationPort}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Carrier / Line:</td>
          <td style="padding: 6px 0; font-weight: bold;">${props.carrierName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Vessel / Voyage:</td>
          <td style="padding: 6px 0; font-weight: bold;">${props.vesselOrFlight}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Cargo:</td>
          <td style="padding: 6px 0;">${props.cargoDescription}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #94a3b8; line-height: 1.4;">
      Please ensure export declaration documents and packing lists are uploaded to your document vault at least 48 hours prior to cargo cut-off.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function renderMilestoneUpdateEmail(props: MilestoneEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Milestone Update — ${props.trackingNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 32px;">
    <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">FORWARD<span style="color: #fff;">FLOW</span> LOGISTICS</h2>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Milestone Status Notification</p>

    <div style="margin: 20px 0; padding: 16px; background: #0f172a; border-left: 4px solid #38bdf8; border-radius: 6px;">
      <span style="font-family: monospace; font-size: 12px; color: #38bdf8;">${props.trackingNumber}</span>
      <h3 style="margin: 6px 0 2px 0; font-size: 16px; color: #fff;">${props.milestoneTitle}</h3>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">Location: ${props.location} • ${new Date(props.occurredAt).toUTCString()}</p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #cbd5e1;">${props.description}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function renderCustomsHoldNoticeEmail(props: CustomsHoldEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ACTION REQUIRED: Customs Inspection Hold — ${props.trackingNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #dc2626; padding: 32px;">
    <div style="background: #ef4444; color: #fff; padding: 4px 10px; border-radius: 4px; display: inline-block; font-size: 11px; font-weight: bold; text-transform: uppercase;">
      Urgent Customs Exception
    </div>
    <h2 style="color: #f87171; margin: 12px 0 4px 0; font-size: 18px;">Customs Hold Flagged for Consignment ${props.trackingNumber}</h2>
    <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">
      Customs authorities (<strong>${props.authority}</strong>) at <strong>${props.location}</strong> have placed this shipment on an operational hold.
    </p>

    <div style="background: #450a0a; border: 1px solid #b91c1c; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; font-size: 13px; color: #fca5a5;"><strong>Hold Reason:</strong> ${props.holdReason.replace("_", " ")}</p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #fff;"><strong>Action Required:</strong> ${props.actionRequired}</p>
    </div>

    <p style="font-size: 12px; color: #94a3b8;">
      Please review required documentation immediately in your customer portal to avoid terminal demurrage or detention charges.
    </p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Formats urgent, high-priority WhatsApp/SMS messages for instant delivery.
 */
export function formatUrgentSmsAlert({
  trackingNumber,
  alertType,
  message,
}: {
  trackingNumber: string;
  alertType: "CUSTOMS_HOLD" | "VESSEL_DELAY" | "GATE_IN_EXCEPTION" | "DELIVERY_SCHEDULED";
  message: string;
}): string {
  const prefix = alertType === "CUSTOMS_HOLD" ? "[URGENT CUSTOMS HOLD]" : "[FORWARD-FLOW ALERT]";
  return `${prefix} Shipment ${trackingNumber}: ${message} Visit https://forwardflow.example/track?number=${trackingNumber} for live custody record.`;
}
