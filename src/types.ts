// src/types.ts

import { Types } from 'mongoose';

export interface ISubtitle {
  title: string;
  titledetail: string;
}

export interface ISizeQuantity {
  size: string;
  quantity: number;
}

export interface IColorQuantity {
  color: string;
  quantity: number;
}

export interface IProduct {
  _id?: Types.ObjectId | string; // Optional for new products
  product_name: string;
  code: string[];
  colors: IColorQuantity[]; // Updated to include color quantities
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  imageFiles?: File[]; // For image uploads
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

export interface IProductType {
  _id?: Types.ObjectId | string;
  types_name: string;
  product_catagory: IProductCategory[];
}
