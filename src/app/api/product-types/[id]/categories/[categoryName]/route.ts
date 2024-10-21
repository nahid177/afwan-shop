// src/app/api/product-types/[id]/categories/[categoryName]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';
import mongoose from 'mongoose';

// Connect to the database
dbConnect();

// Local Interface Definitions
interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface INewProduct {
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
}

interface IProductTypeLean {
  _id: string;
  types_name: string;
  product_catagory: {
    catagory_name: string;
    product: any[]; // Can be more strictly typed if necessary
  }[];
}

// Handle GET request: Retrieve all products in a specific category
export async function GET(
  req: Request,
  { params }: { params: { id: string; categoryName: string } }
) {
  try {
    const { id, categoryName } = params;

    // Logging for debugging
    console.log(`GET request for ProductType ID: ${id}, Category Name: ${categoryName}`);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ProductType ID' }, { status: 400 });
    }

    // Find the ProductType with the specified id, and get a plain object
    const productType = await ProductTypes.findById(id).lean<IProductTypeLean>();

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    const category = productType.product_catagory.find(
      (cat) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category.product, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}

// Handle PATCH request: Add new products to a specific category
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; categoryName: string } }
) {
  try {
    const { id, categoryName } = params;
    const body = await req.json();
    const { product } = body;

    // Logging for debugging
    console.log(`PATCH request for ProductType ID: ${id}, Category Name: ${categoryName}`);

    // Validate input
    if (!product || !Array.isArray(product)) {
      return NextResponse.json({ message: 'Product array is required' }, { status: 400 });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ProductType ID' }, { status: 400 });
    }

    // Find the ProductType by ID
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json({ message: 'ProductType not found' }, { status: 404 });
    }

    // Find the specific category
    const categoryIndex = productType.product_catagory.findIndex(
      (cat: { catagory_name: string; }) => cat.catagory_name.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryIndex === -1) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Sanitize products by removing any _id fields
    const sanitizedProducts: INewProduct[] = product.map(({ _id, ...rest }) => rest);

    // Add sanitized products to the category
    productType.product_catagory[categoryIndex].product.push(...sanitizedProducts);

    // Save the updated ProductType
    await productType.save();

    return NextResponse.json(productType.product_catagory[categoryIndex].product, { status: 200 });
  } catch (error) {
    console.error('Error adding products:', error);
    return NextResponse.json({ message: 'Error adding products' }, { status: 500 });
  }
}
