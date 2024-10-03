import mongoose, { Schema, Document } from 'mongoose';

// Interface for Promo Code schema
interface IPromoCode extends Document {
  code: string; // Promo code string
  discountValue: number; // Discount value (could be a percentage or fixed amount)
  isActive: boolean; // Whether the promo code is active or not
  startDate?: Date; // Optional start date
  endDate?: Date; // Optional expiration date
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Promo Code schema
const PromoCodeSchema: Schema = new Schema<IPromoCode>({
  code: { type: String, required: true, unique: true }, // Promo code (must be unique)
  discountValue: { type: Number, required: true }, // Discount value
  isActive: { type: Boolean, default: true }, // Default to true (active promo code)
  startDate: { type: Date }, // Optional start date for the promo code
  endDate: { type: Date }, // Optional expiration date for the promo code
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Promo Code model
const PromoCode = mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);
export default PromoCode;
