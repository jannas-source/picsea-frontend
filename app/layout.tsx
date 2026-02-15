import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicSea — Marine Procurement Intelligence | 7-SENSE",
  description: "End-to-end intelligent procurement for marine professionals. Photo identification, BOM generation, multi-vendor sourcing, and PO export.",
  keywords: ["marine procurement", "parts identification", "BOM builder", "marine technician", "7-SENSE", "PicSea"],
  authors: [{ name: "7-SENSE Marine" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
