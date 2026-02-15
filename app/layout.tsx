import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicSea - Marine Parts Visual Recognition | 7-SENSE",
  description: "Upload a photo, get exact SKU, pricing, and stock status in seconds. Visual recognition technology for marine parts identification.",
  keywords: ["marine parts", "boat parts", "visual recognition", "parts identification", "7-SENSE", "PicSea"],
  authors: [{ name: "7-SENSE Marine" }],
  openGraph: {
    title: "PicSea - Marine Parts Visual Recognition",
    description: "Photo to Part. Instant Match. Visual recognition technology for the modern boating industry.",
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
