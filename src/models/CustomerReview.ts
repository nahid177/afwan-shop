// src/models/CustomerReview.ts

import mongoose, { Schema, Document } from 'mongoose';

// Interface for customer review
interface ICustomerReview extends Document {
  user: string; // User's name
  reviewText: string; // Review content
  imageUrl: string; // Image URL (uploaded to S3)
  isActive: boolean; // Whether the review is active or not
  approved: boolean; // Whether the review is approved by admin
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Customer Review schema
const CustomerReviewSchema: Schema = new Schema<ICustomerReview>(
  {
    user: { type: String, required: true }, // Name
    reviewText: { type: String, required: true }, // The review text content
    imageUrl: { type: String, required: true }, // URL for the review image
    isActive: { type: Boolean, default: true }, // Default to true (active review)
    approved: { type: Boolean, default: false }, // Default to false (not approved)
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Create the Customer Review model
const CustomerReview =
  mongoose.models.CustomerReview ||
  mongoose.model<ICustomerReview>('CustomerReview', CustomerReviewSchema);

export default CustomerReview;
