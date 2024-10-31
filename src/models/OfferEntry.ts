// src/models/OfferEntry.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOfferEntry extends Document {
  title: string;
  detail: string;
  endTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferEntrySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    detail: { type: String, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Transform dates when converting to JSON
OfferEntrySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    if (ret.endTime) ret.endTime = ret.endTime.toISOString();
    if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
    if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
    return ret;
  },
});

const OfferEntry: Model<IOfferEntry> =
  mongoose.models.OfferEntry ||
  mongoose.model<IOfferEntry>('OfferEntry', OfferEntrySchema);

export default OfferEntry;
