
import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TopNavbar from "@/components/NavBar/shared/TopNavbar";
import { ThemeProvider } from "@/mode/ThemeContext"; // Import ThemeProvider for dark/light mode

// Importing custom fonts
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

// Metadata for SEO purposes
export const metadata: Metadata = {
  title: "Afwan Shop",
  description: "Welcome to my shop",
};

// Main RootLayout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ThemeProvider> {/* Wrapping the app with ThemeProvider for dark/light mode */}
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TopNavbar /> {/* NavBar placed outside children to appear on every page */}
          <main>{children}</main>
        </body>
      </ThemeProvider>
    </html>
  );
}
