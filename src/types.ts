// src/types.ts

import mongoose from 'mongoose';
import { StaticImageData } from 'next/image'; // Import StaticImageData

export interface IColorQuantity {
  color: string;
  quantity: number;
}

export interface ISizeQuantity {
  size: string;
  quantity: number;
}

export interface ISubtitle {
  title: string;
  titledetail: string;
}

export interface IProduct {
  imageFiles: File[]; // Changed from never[] to File[]
  _id?: mongoose.Types.ObjectId;
  product_name: string;
  code: string[]; // Assuming multiple codes per product
  colors: IColorQuantity[];
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  buyingPrice: number; // New Field
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  totalQuantity?: number; // Optional field for total quantity
}

export interface IProductCategory {
  category_name: string; // Corrected spelling from 'catagory_name' to 'category_name'
  product: IProduct[];
}

export interface IProductType {
  _id: string;
  types_name: string;
  product_category: IProductCategory[]; // Corrected spelling from 'product_catagory' to 'product_category'
}

export type OrderStatus = "Closed" | "Pending" | "Cancelled"; // Example enum for order status

export interface IStoreOrderProduct {
  productCode: string; // Changed from ReactNode to string
  _id: string; // Changed from Key | null | undefined to string
  offerPrice: number; // Changed from any to number
  productName: string;
  productImage: string;
  product: mongoose.Types.ObjectId; // Reference to product ID
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice?: number; // Optional: Store buyingPrice at order time
}

export interface IStoreOrder {
  status: OrderStatus; // Using the OrderStatus type
  code: string; // Changed from ReactNode to string
  image: string | StaticImageData; // Changed from StaticImport to StaticImageData
  buyingPrice: number; // Changed from any to number
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: IStoreOrderProduct[];
  totalAmount: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
