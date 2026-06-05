import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Rb2bTracking } from "@/components/rb2b-tracking";
import { brand } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: brand.appName,
  description: "AI marketing advisor for small businesses.",
  applicationName: brand.appName,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: brand.appShortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#155e75",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Rb2bTracking />
      </body>
    </html>
  );
}
