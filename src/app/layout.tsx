import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ForwardFlow Logistics — Intelligent Global Freight Forwarding",
    template: "%s | ForwardFlow Logistics",
  },
  description:
    "Enterprise freight forwarding, automated ocean and air cargo quoting, live milestone tracking, digital customs clearance, and global supply chain orchestration.",
  keywords: [
    "freight forwarding",
    "ocean freight",
    "air cargo",
    "customs clearance",
    "container tracking",
    "FCL",
    "LCL",
    "logistics software",
  ],
  authors: [{ name: "ForwardFlow Logistics Engineering Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
