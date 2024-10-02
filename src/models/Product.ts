import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Interface for subtitle structure
export interface ISubtitle {
  _id: Types.ObjectId;
  title: string;
  titledetail: string;
  subtitle: ISubtitle[];
}

// Interface for the product structure
export interface IProduct extends Document {
  _id: Types.ObjectId;
  product_name: string;
  code: string[]; // Array of strings for codes
  color: string[]; // Unrestricted array of colors
  size: string[]; // Unrestricted array of sizes
  quantity: number;
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for product categories
export interface IProductCategory extends Document {
  _id: Types.ObjectId;
  catagory_name: string;
  product: Types.DocumentArray<IProduct>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for product types
export interface IProductTypes extends Document {
  _id: Types.ObjectId;
  types_name: string;
  product_catagory: Types.DocumentArray<IProductCategory>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Subtitle schema
const SubtitleSchema: Schema = new Schema<ISubtitle>({
  title: { type: String, required: true },
  titledetail: { type: String, required: true },
  subtitle: { type: [{ type: Schema.Types.ObjectId, ref: 'Subtitle' }], default: [] },
});

// Product schema allowing any size and color values
const ProductSchema: Schema = new Schema<IProduct>(
  {
    product_name: { type: String, required: true, trim: true },
    code: { type: [String], required: true, unique: true, index: true }, // Array of product codes
    color: { type: [String], required: true }, // Allowing any color
    size: { type: [String], required: true },  // Allowing any size
    quantity: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    title: { type: [String], required: true },
    subtitle: { type: [SubtitleSchema], default: [] },
    description: { type: String, required: true, trim: true },
    images: { type: [String], required: true },
  },
  { timestamps: true }
);

// Category schema without typeId
const ProductCategorySchema: Schema = new Schema<IProductCategory>(
  {
    catagory_name: { type: String, required: true, trim: true, index: true },
    product: { type: [ProductSchema], default: [] },
  },
  { timestamps: true }
);

// Product Types schema
const ProductTypesSchema: Schema = new Schema<IProductTypes>(
  {
    types_name: { type: String, required: true, trim: true, index: true },
    product_catagory: { type: [ProductCategorySchema], default: [] },
  },
  { timestamps: true }
);

// Middleware to check price logic before saving a product
ProductSchema.pre<IProduct>('save', function (next) {
  if (this.offerPrice > this.originalPrice) {
    next(new Error('Offer price cannot be greater than the original price'));
  } else {
    next();
  }
});

// Compile and export the models
export const ProductTypes: Model<IProductTypes> = mongoose.models.ProductTypes || mongoose.model<IProductTypes>('ProductTypes', ProductTypesSchema);
