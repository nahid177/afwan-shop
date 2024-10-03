import mongoose, { Schema, Document } from 'mongoose';

// Interface for customer review
interface ICustomerReview extends Document {
  user: string; // User's name or user ID
  reviewText: string; // Review content
  imageUrl: string; // Image URL (could be uploaded to S3)
  isActive: boolean; // Whether the review is active or not
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Customer Review schema
const CustomerReviewSchema: Schema = new Schema<ICustomerReview>({
  user: { type: String, required: true }, // The name or ID of the user leaving the review
  reviewText: { type: String, required: true }, // The review text content
  imageUrl: { type: String, required: true }, // URL for the review image (could be an image link or uploaded image URL)
  isActive: { type: Boolean, default: true }, // Default to true (active review)
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Customer Review model
const CustomerReview = mongoose.models.CustomerReview || mongoose.model<ICustomerReview>('CustomerReview', CustomerReviewSchema);
export default CustomerReview;
