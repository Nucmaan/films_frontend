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
  description: "System Architecture for Dubbing Film Department",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
