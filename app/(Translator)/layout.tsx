import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import AutoLogoutClient from "./AutoLogoutClient";

import ToasterClient from "./ToasterClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Astaan",
  description: "Translator Dashboard",
};

export default function TranslatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.variable} antialiased`}
      >
        <AutoLogoutClient />
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
