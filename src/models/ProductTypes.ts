// src/models/ProductTypes.ts

import mongoose, { Schema, Document } from 'mongoose';

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

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
  colors: IColorQuantity[];
  sizes: ISizeQuantity[];
  buyingPrice: number; // New Field
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

export interface IProductType extends Document {
  types_name: string;
  product_catagory: IProductCategory[];
}

const ColorQuantitySchema = new Schema<IColorQuantity>({
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const SizeQuantitySchema = new Schema<ISizeQuantity>({
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const SubtitleSchema = new Schema<ISubtitle>({
  title: { type: String, required: true },
  titledetail: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>({
  product_name: { type: String, required: true },
  code: [{ type: String, required: true }],
  colors: [ColorQuantitySchema], // Correctly define colors field
  sizes: [SizeQuantitySchema],
  buyingPrice: { type: Number, required: true }, // New Field
  originalPrice: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  title: [{ type: String, required: true }],
  subtitle: [SubtitleSchema],
  description: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ProductCategorySchema = new Schema<IProductCategory>({
  catagory_name: { type: String, required: true },
  product: [ProductSchema],
});

const ProductTypeSchema = new Schema<IProductType>({
  types_name: { type: String, required: true },
  product_catagory: [ProductCategorySchema],
});

export const ProductTypes =
  mongoose.models.ProductTypes ||
  mongoose.model<IProductType>('ProductTypes', ProductTypeSchema);
