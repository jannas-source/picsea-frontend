import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000C18",
};

export const metadata: Metadata = {
  title: "PicSea — Marine Procurement Intelligence | 7-SENSE",
  description:
    "End-to-end intelligent procurement for marine professionals. Photo identification, BOM generation, multi-vendor sourcing, and PO export.",
  keywords: [
    "marine procurement",
    "parts identification",
    "BOM builder",
    "marine technician",
    "7-SENSE",
    "PicSea",
  ],
  authors: [{ name: "7-SENSE Marine" }],
  openGraph: {
    title: "PicSea — Marine Procurement Intelligence",
    description:
      "Photo → Part ID → BOM → Purchase Order. AI-powered procurement for marine professionals.",
    type: "website",
    siteName: "PicSea by 7-SENSE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body
        className="antialiased"
        style={{
          fontFamily: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#000C18",
          color: "#FFFFFF",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
