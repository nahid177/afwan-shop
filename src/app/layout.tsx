// src/app/layout.tsx

import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/mode/ThemeContext";
import { CartProvider } from "@/context/CartContext"; // Import the CartProvider
 import TopNavbar from "@/components/NavBar/shared/TopNavbar";
 import ButtomNavbar from "@/components/NavBar/shared/ButtomNavbar";
import axios from "axios";

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

// Fetch product types server-side
async function fetchProductTypes() {
   try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product-types`);
    return response.data;
  } catch (error) {
     console.error("Error fetching product types:", error);
     return [];
  }
 }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 const productTypes = await fetchProductTypes(); // Fetch data here

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CartProvider>
            {/* Pass productTypes to ButtomNavbar */}
             <TopNavbar />
            <ButtomNavbar productTypes={productTypes} /> 
            <main>{children}</main>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
