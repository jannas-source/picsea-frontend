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
  title: "PicSea — Snap. Identify. Order. | 7-SENSE Marine",
  description:
    "Field-ready marine parts identification and procurement. Photograph a part, get instant matches from 29,000+ records, build your order, and get back to work.",
  keywords: [
    "marine parts",
    "parts identification",
    "marine procurement",
    "marine technician",
    "7-SENSE",
    "PicSea",
    "boat parts",
    "marine ordering",
  ],
  authors: [{ name: "7-SENSE Marine" }],
  openGraph: {
    title: "PicSea — Snap. Identify. Order.",
    description:
      "Photo → Part ID → Order. Field-tested procurement for marine professionals.",
    type: "website",
    siteName: "PicSea by 7-SENSE Marine",
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
          minHeight: "100dvh",
          overscrollBehavior: "none",
        }}
      >
        {children}
      </body>
    </html>
  );
}
