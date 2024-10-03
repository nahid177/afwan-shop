import mongoose, { Schema, Document } from 'mongoose';

// Interface for a single delivery area
interface IDeliveryArea {
  area: string; // The name of the delivery area
  price: number; // The delivery price for this area
}

// Interface for the entire Delivery Area schema
interface IDeliveryAreas extends Document {
  areas: IDeliveryArea[]; // Array of areas and prices
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema for storing an array of delivery areas
const DeliveryAreasSchema: Schema = new Schema<IDeliveryAreas>({
  areas: [
    {
      area: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Delivery Areas model
const DeliveryAreas = mongoose.models.DeliveryAreas || mongoose.model<IDeliveryAreas>('DeliveryAreas', DeliveryAreasSchema);
export default DeliveryAreas;
