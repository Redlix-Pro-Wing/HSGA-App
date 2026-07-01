import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import PWARegister from "@/app/components/pwa/PWARegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HSGA",
  description: "Secure Access Portal System",
  manifest: "/manifest.json",
  icons: {
    icon: "https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088",
    shortcut: "https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088",
    apple: "https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088",
  },
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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088" />
        <link rel="shortcut icon" href="https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088" />
        <link rel="apple-touch-icon" href="https://ik.imagekit.io/dypkhqxip/APP%20ICON.png?updatedAt=1782852143088" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
