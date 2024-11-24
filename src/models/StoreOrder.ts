// src/models/StoreOrder.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreOrderProduct {
  productType: mongoose.Types.ObjectId; // Reference to ProductTypes
  productId: mongoose.Types.ObjectId; // Reference to specific product within ProductTypes
  productName: string;
  productCode: string; // Added productCode for better traceability
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
  code: string; // Unique order code
  createdAt?: Date;
  updatedAt?: Date;
}

const StoreOrderProductSchema = new Schema<IStoreOrderProduct>({
  productType: { type: Schema.Types.ObjectId, ref: 'ProductTypes', required: true },
  productId: { type: Schema.Types.ObjectId, required: true }, // No ref since it's an embedded document
  productName: { type: String, required: true },
  productCode: { type: String, required: true },
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
  code: { type: String, unique: true, required: true }, // Ensure uniqueness for order codes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Avoid schema caching issues in development
if (mongoose.models.StoreOrder) {
  delete mongoose.models.StoreOrder;
}

const StoreOrder: Model<IStoreOrderDocument> = mongoose.model<IStoreOrderDocument>('StoreOrder', StoreOrderSchema);

export default StoreOrder;
