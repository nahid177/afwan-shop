// src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
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
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'ProductTypes', required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
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
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
