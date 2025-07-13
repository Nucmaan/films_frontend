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
  description: "Voice-over Artist Dashboard",
};

export default function VoiceOverArtistLayout({
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
