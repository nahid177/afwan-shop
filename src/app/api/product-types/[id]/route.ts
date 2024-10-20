// /src/app/api/product-types/[id]/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { ProductTypes } from '@/models/ProductTypes';
import { Types } from 'mongoose';

dbConnect();

interface ISubtitle {
  title: string;
  titledetail: string;
}

interface ISizeQuantity {
  size: string;
  quantity: number;
}

interface IProduct {
  _id: Types.ObjectId;
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
  catagory_name: string; // Match backend field name
  product: IProduct[];
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const productType = await ProductTypes.findById(id);

    if (!productType) {
      return NextResponse.json(
        { message: 'Product type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(productType, { status: 200 });
  } catch (error) {
    console.error('Error fetching product type:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Error fetching product type' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { product_catagory = [] }: { product_catagory: IProductCategory[] } = body;

    // Validate category names
    product_catagory.forEach((category: IProductCategory) => {
      if (!category.catagory_name || category.catagory_name.trim() === '') {
        throw new Error(`'catagory_name' is required for all categories.`);
      }
    });

    const productType = await ProductTypes.findById(params.id);
    if (!productType) {
      return NextResponse.json(
        { message: 'ProductType not found' },
        { status: 404 }
      );
    }

    // Ensure product_catagory exists
    if (!Array.isArray(productType.product_catagory)) {
      productType.product_catagory = [];
    }

    // Update or add new categories
    product_catagory.forEach((newCategory: IProductCategory) => {
      const existingIndex = productType.product_catagory.findIndex(
        (category: { catagory_name: string; }) => category.catagory_name === newCategory.catagory_name
      );

      if (existingIndex >= 0) {
        // Merge products into existing category
        productType.product_catagory[existingIndex].product.push(...newCategory.product);
      } else {
        // Add new category
        productType.product_catagory.push(newCategory);
      }
    });

    await productType.save();

    return NextResponse.json(productType, { status: 200 });
  } catch (error) {
    console.error('Error updating product type:', error);
    return NextResponse.json(
      { message: (error as Error).message || 'Error updating product type' },
      { status: 500 }
    );
  }
}
