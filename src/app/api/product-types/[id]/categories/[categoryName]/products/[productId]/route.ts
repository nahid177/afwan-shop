import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Interface Definitions
interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface IProduct {
  _id: mongoose.Types.ObjectId;
  product_name: string;
  code: string[];
  color: string[];
  sizes: ISizeQuantity[];
  originalPrice: number;
  offerPrice: number;
  title: string[];
  subtitle: ISubtitle[];
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface IProductCategory {
  catagory_name: string;
  product: IProduct[];
}

interface IProductType {
  _id: mongoose.Types.ObjectId;
  types_name: string;
  product_catagory: IProductCategory[];
}

// Import the model
import { ProductTypes } from '@/models/ProductTypes';

// Handle GET request: Retrieve a specific product in a category
export async function GET(
  req: Request,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  try {
    const { id, categoryName, productId } = params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Find the ProductType with the specified id
    const productType = await ProductTypes.findById(id).lean<IProductType>();

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: IProductCategory) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the specific product
    const product = category.product.find(
      (prod: IProduct) => prod._id.toString() === productId
    );

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ message: 'Error fetching product' }, { status: 500 });
  }
}

// Handle PUT request: Update a specific product in a category
export async function PUT(
  req: Request,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  try {
    const { id, categoryName, productId } = params;
    const body = await req.json();

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: IProductCategory) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the index of the product
    const productIndex = category.product.findIndex(
      (prod: IProduct) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update the product
    category.product[productIndex] = {
      ...category.product[productIndex],
      ...body,
      _id: category.product[productIndex]._id, // Ensure _id is not modified
    };

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json(category.product[productIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

// Handle DELETE request: Delete a specific product in a category
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; categoryName: string; productId: string } }
) {
  try {
    const { id, categoryName, productId } = params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const category = productType.product_catagory.find(
      (cat: IProductCategory) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Find the index of the product
    const productIndex = category.product.findIndex(
      (prod: IProduct) => prod._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Remove the product
    category.product.splice(productIndex, 1);

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
