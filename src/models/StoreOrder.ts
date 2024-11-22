// src/models/StoreOrder.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreOrderProduct {
  product: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  color?: string;
  size?: string;
  buyingPrice: number;
  offerPrice: number;
}

export interface IStoreOrderDocument extends Document {
  customerName: string;
  customerPhone: string;
  products: IStoreOrderProduct[];
  totalAmount: number;
  totalBeforeDiscount: number;
  discount: number;
  approved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const StoreOrderProductSchema = new Schema<IStoreOrderProduct>({
  product: { type: Schema.Types.ObjectId, ref: 'ProductTypes', required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  buyingPrice: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
});

const StoreOrderSchema = new Schema<IStoreOrderDocument>({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  products: [StoreOrderProductSchema],
  totalAmount: { type: Number, required: true },
  totalBeforeDiscount: { type: Number, required: true },
  discount: { type: Number, required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure the model is properly redefined to avoid schema caching issues
if (mongoose.models.StoreOrder) {
  delete mongoose.models.StoreOrder;
}

const StoreOrder: Model<IStoreOrderDocument> = mongoose.model<IStoreOrderDocument>('StoreOrder', StoreOrderSchema);

export default StoreOrder;
