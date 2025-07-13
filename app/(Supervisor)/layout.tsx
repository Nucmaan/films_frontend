import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ToasterClient from "./ToasterClient";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Astaan",
  description: "Supervisor Dashboard",
};

export default function SupervisorLayout({
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
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
