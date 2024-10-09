import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import TopNavbar from "@/components/NavBar/shared/TopNavbar";
import { ThemeProvider } from "@/mode/ThemeContext";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <TopNavbar />
          <main>{children}</main>
        </body>
      </ThemeProvider>
    </html>
  );
}
