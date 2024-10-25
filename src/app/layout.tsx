// src/app/layout.tsx

import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/mode/ThemeContext";
import TopNavbar from "@/components/NavBar/shared/TopNavbar";
import ButtomNavbar from "@/components/NavBar/shared/ButtomNavbar";

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

export const metadata = {
  title: "Afwan Shop",
  description: "Welcome to my shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TopNavbar />
          <ButtomNavbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
