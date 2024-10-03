import mongoose, { Schema, Document } from 'mongoose';

// Interface for offer entry
interface IOfferEntry extends Document {
  title: string; // Title of the offer entry
  name: string; // Admin's name
  endTime: Date; // End time for the offer
  isActive: boolean; // Whether the offer is active or not
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Offer Entry schema
const OfferEntrySchema: Schema = new Schema<IOfferEntry>({
  title: { type: String, required: true }, // Title of the offer
  name: { type: String, required: true }, // Admin's name
  endTime: { type: Date, required: true }, // End time (offer expiration or completion time)
  isActive: { type: Boolean, default: true }, // Default to true (active offer)
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Offer Entry model
const OfferEntry = mongoose.models.OfferEntry || mongoose.model<IOfferEntry>('OfferEntry', OfferEntrySchema);
export default OfferEntry;
