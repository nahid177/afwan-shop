// /models/ProductTypes.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

interface ISubtitle {
  title: string;
  titledetail: string;
}

interface IProduct extends Document {
  _id: Types.ObjectId;
  product_name: string;
  code: string[];
  color: string[];
  size: string[];
  quantity: number;
  originalPrice: number;
  offerPrice: number;
  title: string[]; // Array of strings
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface IProductCategory extends Document {
  catagory_name: string;
  product: IProduct[];
}

interface IProductType extends Document {
  types_name: string;
  product_catagory: IProductCategory[];
}

const SubtitleSchema = new Schema<ISubtitle>({
  title: { type: String },
  titledetail: { type: String },
});

const ProductSchema = new Schema<IProduct>(
  {
    product_name: { type: String, required: true },
    code: [{ type: String }],
    color: [{ type: String }],
    size: [{ type: String }],
    quantity: { type: Number },
    originalPrice: { type: Number },
    offerPrice: { type: Number },
    title: [{ type: String }], // This field is correctly defined
    subtitle: [SubtitleSchema],
    description: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true }
);

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
