// src/models/Order.ts

import mongoose, { Schema, Document } from 'mongoose';

// Extend the IOrderItem interface to include image, buyingPrice, and code
export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;        // Selling price
  buyingPrice: number;  // Cost price
  image: string;        // URL of the product image
  code: string[];       // Array of product codes
}

export interface IOrder extends Document {
  _id: string;
  customerName: string;
  customerNumber: string;
  otherNumber?: string;
  address1: string;
  address2?: string;
  items: IOrderItem[];
  totalAmount: number;
  approved: boolean;
  status: 'open' | 'close'; // New status field
  createdAt: Date;
  updatedAt: Date;
}

// Updated OrderItemSchema with image, buyingPrice, and code
const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'ProductTypes', required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  buyingPrice: { type: Number, required: true }, // New field
  image: { type: String, required: true },        // New field
  code: { type: [String], required: true },       // New field
});

const OrderSchema = new Schema<IOrder>(
  {
    customerName: { type: String, required: true },
    customerNumber: { type: String, required: true },
    otherNumber: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    approved: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ['open', 'close'], default: 'open' }, // New status field
  },
  {
    timestamps: true,
  }
);

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
