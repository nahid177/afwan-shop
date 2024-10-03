import mongoose, { Schema, Document } from 'mongoose';

// Interface for Carousel schema
interface ICarousel extends Document {
  name: string; // Store the name here
  imageUrl: string; // Store the image URL
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the Carousel schema
const CarouselSchema: Schema = new Schema<ICarousel>({
  name: { type: String, required: true, trim: true }, // Name of the image
  imageUrl: { type: String, required: true, trim: true }, // Image URL
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create the Carousel model
const Carousel = mongoose.models.Carousel || mongoose.model<ICarousel>('Carousel', CarouselSchema);
export default Carousel;
