// src/models/Profit.ts

import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Interface for the subdocument in titles array
 */
export interface ITitle { // Exported
  name: string;
  description?: string;
  // Add other relevant fields if necessary
}

/**
 * Interface for the subdocument in otherCosts array
 */
export interface IOtherCost { // Exported
  name: string;
  amount: number;
  // Add other relevant fields if necessary
}

/**
 * Interface for Profit document
 */
export interface IProfit extends Document {
  totalProductsSold: number; 
  totalRevenue: number;    
  ourProfit: number;      
  titles: ITitle[];
  otherCosts: IOtherCost[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for Title subdocument
 */
const TitleSchema: Schema<ITitle> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    // Add other fields as needed
  },
  { _id: false } // Prevents creation of _id for subdocuments
);

/**
 * Schema for OtherCost subdocument
 */
const OtherCostSchema: Schema<IOtherCost> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    // Add other fields as needed
  },
  { _id: false }
);

/**
 * Main Profit Schema
 */
const ProfitSchema: Schema<IProfit> = new Schema(
  {
    totalProductsSold: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Total products sold cannot be negative"],
    },
    totalRevenue: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Total revenue cannot be negative"],
    },
    ourProfit: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Our profit cannot be negative"],
    },
    titles: {
      type: [TitleSchema],
      default: [],
    },
    otherCosts: {
      type: [OtherCostSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Prevent recompilation in development
 */
const Profit: Model<IProfit> =
  mongoose.models.Profit || mongoose.model<IProfit>("Profit", ProfitSchema);

export default Profit;
