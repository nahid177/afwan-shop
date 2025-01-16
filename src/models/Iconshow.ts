import mongoose, { Schema, Document } from 'mongoose';

// Interface for Carousel schema
interface IIconshow extends Document {
  name: string;
  imageUrl: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Iconshow schema
const IconshowSchema: Schema = new Schema<IIconshow>({
  name: { type: String, required: true, trim: true },
  imageUrl: { type: String, required: true, trim: true },
  link: { type: String, trim: true },
}, { timestamps: true });

const Iconshow = mongoose.models.Iconshow || mongoose.model<IIconshow>('Iconshow', IconshowSchema);

export default Iconshow;
