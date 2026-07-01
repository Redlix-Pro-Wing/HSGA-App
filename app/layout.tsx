import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWARegister from "@/app/components/pwa/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HSGA",
  description: "Secure Access Portal System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HSGA",
  },
};

export const viewport: Viewport = {
  themeColor: "#002f6c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
