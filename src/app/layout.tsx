import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TopNavbar from "@/components/NavBar/shared/TopNavbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Afwan Shop",
  description: "Welcome to my shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        <TopNavbar /> {/* NavBar should be placed outside children */}
        <main>{children}</main>
      </body>
    </html>
  );
}
