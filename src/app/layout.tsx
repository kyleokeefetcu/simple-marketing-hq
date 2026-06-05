import type { Metadata, Viewport } from "next";
import { Rb2bTracking } from "@/components/rb2b-tracking";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Marketing HQ",
  description: "An AI marketing advisor for small businesses.",
  applicationName: "Simple Marketing HQ",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Simple HQ",
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
  children: React.ReactNode;
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
