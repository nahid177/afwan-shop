// src/app/layout.tsx

import React from "react";
import localFont from "next/font/local";
import "./globals.css";
 {/* 
import { ThemeProvider } from "@/mode/ThemeContext";
import { CartProvider } from "@/context/CartContext"; // Import the CartProvider
import TopNavbar from "@/components/NavBar/shared/TopNavbar";
import ButtomNavbar from "@/components/NavBar/shared/ButtomNavbar";     
*/}

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
  description: "Welcome to my Afwan shop",
};

export default function RootLayout({
 // children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
    {/* Video Only */}
<div className="video-section w-full ">
  <video className="w-full" autoPlay loop>
    <source src="/afwan.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

          
          {/* Commented out the ThemeProvider and CartProvider sections */}
        {/* 
        <ThemeProvider>
          <CartProvider>
            <TopNavbar />
            <ButtomNavbar />
            <main>{children}</main>
          </CartProvider>
        </ThemeProvider> 
        */}
      </body>
    </html>
  );
}
