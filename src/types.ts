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
  imageFiles?: File[]; // Optional now
  _id?: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
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

export interface IProductCategory {
  category_name: string; // Correct spelling
  product: IProduct[];
}

export interface IProductType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product_catagory: any;
  _id: string;
  types_name: string;
  product_category: IProductCategory[]; // Corrected spelling from 'product_catagory' to 'product_category'
}

export type OrderStatus = "Closed" | "Pending" | "Cancelled"; // Example enum for order status

// In src/types.ts

export interface IStoreOrderProduct {
  productCode: string;
  _id?: string; // Make optional for creation time
  offerPrice: number;
  productName: string;
  productImage: string;
  product?: mongoose.Types.ObjectId; // Make optional
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice?: number; 
  productId?: string;    // Add this for creation
  productType?: string;  // Add this for creation
}


export interface IStoreOrder {
  status: OrderStatus; // Using the OrderStatus type
  code: string; // Changed from ReactNode to string
  image: string | StaticImageData; // Changed from StaticImport to StaticImageData
  buyingPrice: number; // Changed from any to number
  _id: string;
  discount: number; // Add this line
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: IStoreOrderProduct[];
  totalAmount: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  totalBeforeDiscount?: number;  // Add this field if you want it optional

}
// In src/types.ts

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
