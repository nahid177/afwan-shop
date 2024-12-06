// src/types.ts

import mongoose from 'mongoose';
import { StaticImageData } from 'next/image';

// Color and Size Interfaces
export interface IColorQuantity {
  color: string;
  quantity: number;
}

export interface ISizeQuantity {
  size: string;
  quantity: number;
}

// Subtitle Interface
export interface ISubtitle {
  title: string;
  titledetail: string;
}

// Product Interface
export interface IProduct {
  imageFiles?: File[]; // Optional
  _id?: mongoose.Types.ObjectId;
  product_name: string;
  code: string[]; // Non-optional
  colors: IColorQuantity[];
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  buyingPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  totalQuantity?: number;
}

// Product Category Interface
export interface IProductCategory {
  catagory_name: string; // Maintained spelling
  product: IProduct[];
}

// Product Type Interface
export interface IProductType {
  product_catagory: IProductCategory[]; // Maintained spelling
  _id: string;
  types_name: string;
}

// Order Status Enum
export type OrderStatus = "Closed" | "Pending" | "Cancelled"; // Example enum for order status

// Store Order Product Interface
export interface IStoreOrderProduct {
  productCode: string;
  _id?: string; // Optional for creation time
  offerPrice: number;
  productName: string;
  productImage: string;
  product?: mongoose.Types.ObjectId; // Optional
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice?: number; 
  productId?: string;    // For creation
  productType?: string;  // For creation
}

// Store Order Interface
export interface IStoreOrder {
  status: OrderStatus;
  code: string; // Changed from ReactNode to string
  image: string | StaticImageData; // Changed from StaticImport to StaticImageData
  buyingPrice: number; // Changed from any to number
  _id: string;
  discount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: IStoreOrderProduct[];
  totalAmount: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  totalBeforeDiscount?: number; // Optional
}

// Order Product Interface
export interface IOrderProduct {
  productType: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice?: number;
  offerPrice: number;
  productImage: string;
}

// Cart Item Interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  buyingPrice: number;
  quantity: number;
  imageUrl: string;
  color?: string;
  size?: string;
  code: string[]; // Non-optional
}
