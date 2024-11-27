import mongoose, { Schema, Document } from 'mongoose';

// Interface for Carousel schema
interface ICarousel extends Document {
  name: string;
  imageUrl: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Carousel schema
const CarouselSchema: Schema = new Schema<ICarousel>({
  name: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  link: { type: String, trim: true },
}, { timestamps: true });

const Carousel = mongoose.models.Carousel || mongoose.model<ICarousel>('Carousel', CarouselSchema);

export default Carousel;
