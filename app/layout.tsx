import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicSea - AI Marine Parts Identification | 7-SENSE",
  description: "Upload a photo, get the exact marine part SKU, pricing, and stock status in seconds. 29,294 parts from CWR Distribution.",
  keywords: ["marine parts", "boat parts", "AI identification", "CWR Distribution", "7-SENSE"],
  authors: [{ name: "7-SENSE Marine" }],
  openGraph: {
    title: "PicSea - AI Marine Parts Identification",
    description: "Photo to Part. Instant Match. 29,294 marine parts catalog.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-deep-abyss-blue">
        {children}
      </body>
    </html>
  );
}
