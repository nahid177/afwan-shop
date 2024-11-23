// src/context/CartContext.tsx

"use client";

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface CartItem {
  id: string;
  name: string;
  price: number;
  buyingPrice: number; // Ensure buyingPrice is included
  quantity: number;
  imageUrl: string;
  size?: string;
  color?: string;
}

interface CartContextProps {
  cartItems: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const INITIAL_CART_ITEMS: CartItem[] = [];

  const [cartItems, setCartItems, isInitialized] = useLocalStorage<CartItem[]>(
    "cartItems",
    INITIAL_CART_ITEMS
  );

  // Debounce saving to localStorage for performance
  useEffect(() => {
    if (isInitialized) {
      const timeoutId = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cartItems", JSON.stringify(cartItems));
        }
      }, 500); // Save after 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.id === item.id && i.size === item.size && i.color === item.color
      );
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    // Optionally, you can add a toast here for removal feedback
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        // Remove the item if quantity is zero or less
        return prevItems.filter((item) => item.id !== id);
      } else {
        return prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
    // Optionally, you can add a toast here for clearing the cart
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!isInitialized) return null; // Only render when localStorage is initialized

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
