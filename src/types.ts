// src/types.ts

import mongoose from 'mongoose';

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
  imageFiles: never[];
  _id?: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
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
  catagory_name: string;
  product: IProduct[];
}

export interface IProductType {
  _id: string;
  types_name: string;
  product_catagory: IProductCategory[];
}

export interface IStoreOrderProduct {
  productCode: ReactNode;
  _id: Key | null | undefined;
  offerPrice: any;
  productName: string;
  productImage: string;
  product: mongoose.Types.ObjectId; // Reference to product ID
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice?: number; // Optional: Store buyingPrice at order time
}

export interface IStoreOrder {
  code: ReactNode;
  image: string | StaticImport;
  buyingPrice: any;
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
