// src/models/StoreOrder.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreOrderProduct {
  product: mongoose.Types.ObjectId; // Reference to product ID
  quantity: number;
  color?: string;
  size?: string;
}

export interface IStoreOrderDocument extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: IStoreOrderProduct[];
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const StoreOrderProductSchema = new Schema<IStoreOrderProduct>({
  product: { type: Schema.Types.ObjectId, ref: 'ProductTypes', required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
});

const StoreOrderSchema = new Schema<IStoreOrderDocument>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  products: [StoreOrderProductSchema],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const StoreOrder: Model<IStoreOrderDocument> =
  mongoose.models.StoreOrder || mongoose.model<IStoreOrderDocument>('StoreOrder', StoreOrderSchema);

export default StoreOrder;
