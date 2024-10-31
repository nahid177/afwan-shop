import mongoose, { Schema, Document } from 'mongoose';

interface IDeliveryArea extends Document {
  area: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryAreaSchema: Schema = new Schema<IDeliveryArea>(
  {
    area: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const DeliveryArea =
  mongoose.models.DeliveryArea ||
  mongoose.model<IDeliveryArea>('DeliveryArea', DeliveryAreaSchema);

export default DeliveryArea;
